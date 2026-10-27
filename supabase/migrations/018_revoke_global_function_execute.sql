-- PostgreSQL's built-in PUBLIC function grant is global and cannot be removed by schema defaults alone.
alter default privileges for role postgres
  revoke execute on functions from public;
