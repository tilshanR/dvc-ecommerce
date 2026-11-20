const serializeAdmin = (adminDoc) => {
  if (!adminDoc) return null;

  return {
    id: adminDoc._id?.toString(),
    name: adminDoc.name,
    email: adminDoc.email,
    role: adminDoc.role,
    isActive: adminDoc.isActive,
    lastLoginAt: adminDoc.lastLoginAt,
    createdAt: adminDoc.createdAt,
  };
};

export const serializeAdmins = (admins = []) => admins.map(serializeAdmin);

export default serializeAdmin;