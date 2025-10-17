import { apiGet, apiPost, apiPatch, apiDelete } from "./client";

export const listItems   = () => apiGet("/api/items/");
export const createItem  = (title) => apiPost("/api/items/", { title, done:false });
export const toggleItem  = (id, done) => apiPatch(`/api/items/${id}/`, { done });
export const deleteItem  = (id) => apiDelete(`/api/items/${id}/`);
