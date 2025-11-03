const API_BASE = (process.env.REACT_APP_API_BASE || '') + '/user/distinct-words';

async function safeFetch(path, opts = {}) {
    const res = await fetch(API_BASE + path, {
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        ...opts
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`Request failed: ${res.status} ${res.statusText}`);
        err.status = res.status;
        err.body = text;
        throw err;
    }
    return res.status === 204 ? null : res.json().catch(() => null);
}

/**
 * Get saved distinctive words for a user.
 * @param {string} userId
 */
export async function getUserDistinctWords(userId = 'anon') {
    return safeFetch(`?user_id=${encodeURIComponent(userId)}`, { method: 'GET' });
}

/**
 * Save (create/overwrite) distinctive words for a user.
 * payload: { items: [{ word, logodds?, score?, count? }, ...] }
 * @param {Array} items
 * @param {string} userId
 */
export async function saveUserDistinctWords(items = [], userId = 'anon') {
    return safeFetch(`?user_id=${encodeURIComponent(userId)}`, {
        method: 'POST',
        body: JSON.stringify({ items })
    });
}

/**
 * Delete saved list for a user.
 * @param {string} userId
 */
export async function deleteUserDistinctWords(userId = 'anon') {
    return safeFetch(`?user_id=${encodeURIComponent(userId)}`, { method: 'DELETE' });
}