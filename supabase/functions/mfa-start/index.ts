import { createMfaHandlers } from "../_shared/emailMfaHandlers.ts";
import { createMfaDependencies } from "../_shared/mfaRuntime.ts";

Deno.serve(createMfaHandlers(createMfaDependencies()).start);
