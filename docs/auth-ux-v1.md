# Authentication UX v1

This sprint implements frontend-only registration and login UX. No authentication provider, database, account creation, credential verification, or persistence is connected.

## Routes

- `/register` presents account registration.
- `/login` presents sign in.
- `/auth` redirects to `/login` for compatibility with the earlier placeholder.
- `/forgot-password` explains that recovery is not enabled.
- `/dashboard` is the mock-success destination and remains a placeholder.

## Registration flow

Registration collects full name, email, password, password confirmation, and Terms/Privacy acceptance. Full name must contain at least two non-whitespace characters, email must have a valid format, passwords require at least eight characters and must match, and Terms acceptance is required.

## Login flow

Login collects a valid email and a non-empty password, with an optional Remember me control. In this prototype, Remember me is visual state only and does not persist credentials or sessions.

## Mock submission behavior

Valid forms briefly display an accessible loading state and navigate to `/dashboard`. The delay exists only to validate interaction feedback; no form values are transmitted or stored.

## Security and privacy

Passwords use the appropriate input types and autocomplete values. Credentials are not logged, stored in localStorage, placed in URLs, or sent to a service. Form state exists only in component memory and is discarded on navigation or refresh.

## Future integration point

A future authentication adapter can replace the mock submit handlers while retaining the route pages, validation presentation, and provider-independent form components. Provider-specific types and secrets must remain outside these UI modules.

## Known limitations

There is no real account, session, recovery email, verification, MFA, OAuth, or dashboard. Client-side validation is UX guidance and must be duplicated securely on the server when a provider is introduced.

## Development authentication bypass

The bypass exists only to speed up local learner-workspace testing. Copy `.env.example` to `.env.local`, then set:

```text
NEXT_PUBLIC_DEV_AUTH_BYPASS=true
```

Restart the development server after changing the value. Set it to `false` or remove it to disable the bypass. The default in `.env.example` is `false`.

When enabled outside production, server-side route composition supplies a transient development learner with ID `dev-user`, name `Development Learner`, and email `dev@localhost`. It is not stored and is not a real account. Registration and login display a development-only link, while learner surfaces show an authentication-bypass banner.

Direct test routes include:

- `/workshops/enterprise-ai-foundations/demo-learning-experience`
- `/dashboard`

The centralized `getDevelopmentAuthContext` helper checks `NODE_ENV` before reading the public flag. It always returns a disabled context when `NODE_ENV === "production"`, even if the environment variable is mistakenly set to `true`. Client components never decide whether the bypass is active, and no query string or browser storage is used.
