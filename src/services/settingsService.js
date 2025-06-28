import prisma from "../models/index.js";

export const getCompanySettings = async() => {
    const settings = await prisma.companySetting.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    })

    return settings;
}

export const updateCompanySettings = async(settingsId, updateData) => {
    const update = await prisma.companySetting.update({
        where: { id: settingsId },
        data: updateData
    })

    return update;
}