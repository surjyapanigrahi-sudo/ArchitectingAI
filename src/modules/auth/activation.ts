import "server-only";
export function accountCollectionEnabled(){return process.env.AUTH_ENABLED==="true";}
