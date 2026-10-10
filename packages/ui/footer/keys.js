const api = "https://api.sassmaker.com";
export class Unreachable extends Error {}
export function createProjectKey(fetch = globalThis.fetch) {
  const keys = Object.create(null);
  function projectKey(form) {
    if (form.dataset.key) return Promise.resolve(form.dataset.key);
    const id = form.dataset.catalog;
    if (!id) return Promise.resolve(null);
    keys[id] ??= fetch(api + "/v1/capture-config/" + encodeURIComponent(id), {
      credentials: "omit",
    })
      .then((r) => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Unreachable(String(r.status));
        return r.json().then((c) => c?.api_key || null);
      })
      .then(
        (key) => {
          if (!key) delete keys[id];
          return key;
        },
        (err) => {
          delete keys[id];
          throw err instanceof Unreachable ? err : new Unreachable(String(err));
        },
      );
    return keys[id];
  }

  return projectKey;
}
