
import api from './api';

export const getSecurityEvents = async () => {
    const response = await api.get('/SecurityEvents');
    return response.data;
};

export const updateSecurityEventReview = async (id, reviewStatus) => {
    const response = await api.put(
        `/security-events/${id}/review`,
        { reviewStatus }
    );

    return response.data;
};
