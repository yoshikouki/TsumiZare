export interface AppEnv {
  Bindings: {
    DEPLOYMENT_GIT_SHA?: string;
    CF_VERSION_METADATA?: { id: string };
  };
}
