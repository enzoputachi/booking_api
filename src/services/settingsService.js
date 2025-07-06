import prisma from "../models/index.js";


export const seedCompanySettings = async() => {
    const existing = await prisma.companySetting.findFirst();
    if (existing) return existing;

    const data = {
        companyName: "Corpers Drive",
        contactEmail: "corpersdrive@gmail.com"
    };

    const settings = await prisma.companySetting.create({
        data,
    })

    return settings;
}

export const getCompanySettings = async() => {
    const settings = await prisma.companySetting.findFirst()

    return settings;
}

export const updateCompanySettings = async(settingsId, updateData) => {
    const update = await prisma.companySetting.update({
        where: { id: settingsId },
        data: updateData
    })

    return update;
}