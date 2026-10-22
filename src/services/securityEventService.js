import api from './api';

export const getSecurityEvents = async () => {
    const response = await api.get('/SecurityEvents');
    return response.data;
};

export const updateSecurityEventReview = async (id, reviewStatus) => {
    // Đã sửa '/security-events/' thành '/SecurityEvents/' để khớp với Backend
    const response = await api.put(
        `/SecurityEvents/${id}/review`,
        { reviewStatus }
    );

    return response.data;
};