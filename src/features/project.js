import { api } from "../utils/axios.js";

export const createproject = async ({ name, description }) => {
    try {
        const { data } = await api.post("/api/project", {
            name,
            description
        });

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getprojects = async () => {
    try {
        const { data } = await api.get("/api/project");

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getprojectById = async (id) => {
    try {
        const { data } = await api.get(`/api/project/${id}`);

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const getstarredproject = async () => {
    try {
        const { data } = await api.get("/api/project/starred");

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const togglestar = async (id) => {
    try {
        const { data } = await api.patch(`/api/project/${id}`);

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const deleteproject = async (id) => {
    try {
        const { data } = await api.delete(`/api/project/${id}`);

        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};