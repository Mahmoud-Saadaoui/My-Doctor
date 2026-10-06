import prisma from '../config/db.js';

/**
 * Public doctor selector - excludes sensitive fields like email.
 * Use this for all public-facing endpoints.
 */
const publicDoctorSelect = {
  id: true,
  name: true,
  userType: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      specialization: true,
      address: true,
      workingHours: true,
      phone: true,
      bio: true,
      consultationFee: true,
      timezone: true,
      isVerified: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

const containsInsensitive = value => ({
  contains: value,
  mode: 'insensitive',
});

const parsePagination = query => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 12, 1), 50);

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Parse and validate geographic search parameters.
 * Returns { lat, lng, radiusKm } or { errorKey }.
 */
const parseGeoParams = (query) => {
  const { lat, lng, radiusKm } = query;

  // If no geo params provided, skip geo filtering
  if (lat === undefined && lng === undefined && radiusKm === undefined) {
    return {};
  }

  // Both lat and lng must be provided together
  if (lat === undefined || lng === undefined) {
    return { errorKey: 'doctors.geoBothCoordsRequired' };
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return { errorKey: 'doctors.geoInvalidCoords' };
  }

  if (latNum < -90 || latNum > 90) {
    return { errorKey: 'doctors.geoInvalidLat' };
  }

  if (lngNum < -180 || lngNum > 180) {
    return { errorKey: 'doctors.geoInvalidLng' };
  }

  // Default radius: 10km, max: 50km
  const radius = radiusKm !== undefined ? Number(radiusKm) : 10;

  if (Number.isNaN(radius) || radius <= 0) {
    return { errorKey: 'doctors.geoInvalidRadius' };
  }

  const maxRadius = Number(process.env.MAX_SEARCH_RADIUS_KM || 50);
  if (radius > maxRadius) {
    return { errorKey: 'doctors.geoRadiusTooLarge' };
  }

  return { lat: latNum, lng: lngNum, radiusKm: radius };
};

/**
 * Calculate Haversine distance between two points in kilometers.
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildDoctorWhere = ({ q, specialization }) => {
  const and = [
    { userType: 'doctor' },
    // Only show verified doctors in public search results
    { profile: { is: { isVerified: true } } },
  ];

  if (q) {
    and.push({
      OR: [
        { name: containsInsensitive(q) },
        { email: containsInsensitive(q) },
        { profile: { is: { specialization: containsInsensitive(q) } } },
      ],
    });
  }

  if (specialization) {
    and.push({
      profile: { is: { specialization: containsInsensitive(specialization) } },
    });
  }

  return { AND: and };
};

const formatTime = value => (value instanceof Date ? value.toISOString().slice(11, 16) : value);

export const index = async (req, res, next) => {
  try {
    const { q, specialization, sort } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const geo = parseGeoParams(req.query);

    if (geo.errorKey) {
      return res.status(400).json({
        message: req.t(geo.errorKey),
        messageKey: geo.errorKey,
      });
    }

    const where = buildDoctorWhere({ q, specialization });

    // If geo search, filter doctors with coordinates and calculate distance
    if (geo.lat !== undefined) {
      // Only include doctors that have coordinates
      where.AND.push({
        profile: { is: { latitude: { not: null }, longitude: { not: null } } },
      });

      const doctors = await prisma.user.findMany({
        where,
        select: publicDoctorSelect,
      });

      // Calculate distance and filter by radius
      const doctorsWithDistance = doctors
        .map(doctor => {
          const lat = doctor.profile.latitude;
          const lng = doctor.profile.longitude;
          const distanceKm = haversineDistance(geo.lat, geo.lng, lat, lng);
          return { ...doctor, distanceKm: Math.round(distanceKm * 100) / 100 };
        })
        .filter(doctor => doctor.distanceKm <= geo.radiusKm);

      // Sort by distance if requested, otherwise by name
      if (sort === 'distance') {
        doctorsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));
      } else {
        doctorsWithDistance.sort((a, b) => a.name.localeCompare(b.name));
      }

      // Paginate
      const total = doctorsWithDistance.length;
      const paginatedDoctors = doctorsWithDistance.slice(skip, skip + limit);

      return res.status(200).json({
        data: paginatedDoctors,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Non-geo search (original behavior)
    const [doctors, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: publicDoctorSelect,
        orderBy: { name: 'asc' },
        take: limit,
        skip,
      }),
      prisma.user.count({ where }),
    ]);

    return res.status(200).json({
      data: doctors,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const show = async (req, res, next) => {
  try {
    const doctor = await prisma.user.findFirst({
      where: { id: Number(req.params.id), userType: 'doctor' },
      select: publicDoctorSelect,
    });

    if (!doctor) {
      return res.status(404).json({
        message: req.t('doctors.notFound'),
        messageKey: 'doctors.notFound',
      });
    }

    return res.status(200).json(doctor);
  } catch (error) {
    return next(error);
  }
};

export const availability = async (req, res, next) => {
  try {
    const doctor = await prisma.user.findFirst({
      where: { id: Number(req.params.id), userType: 'doctor' },
      select: { id: true },
    });

    if (!doctor) {
      return res.status(404).json({
        message: req.t('doctors.notFound'),
        messageKey: 'doctors.notFound',
      });
    }

    const availability = await prisma.availability.findMany({
      where: { doctorId: doctor.id, isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        timezone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(availability.map(slot => ({
      ...slot,
      startTime: formatTime(slot.startTime),
      endTime: formatTime(slot.endTime),
    })));
  } catch (error) {
    return next(error);
  }
};
