
# Security Policy

The code in this library is used to handle cryptocurrency,
which is a security-sensitive field. Therefore, we take
security very seriously and apply the following measures:

- we try to keep third-party dependencies to an absolute
  minimum,

- all generated code is committed to the VCS and is manually
  checked by the release manager before actually releasing
  them,

- all code is getting [automatically checked](https://github.com/ton-js/json-parser/security/code-scanning)
  by the GitHub Code QL with every commit,

- all commits are required to be signed with the PGP keys,

- all accounts used to release the library are protected
  with MFA/OTP,

- additionally, published package is checked by the npm for
  known vulnerabilities,

- we are using Dependabot to make sure that all dependencies
  are secure as well.


## Supported Versions

Please use the latest version of the library to ensure the
best possible security and performance.


## Reporting a Vulnerability

DO NOT PUBLISH VULNERABILITY INFORMATION IN THE OPEN SOURCES.

If you have found a vulnerability in the library, please
write to the [slava@fomin.io](mailto:slava@fomin.io) directly,
so it could be discretely handled.
