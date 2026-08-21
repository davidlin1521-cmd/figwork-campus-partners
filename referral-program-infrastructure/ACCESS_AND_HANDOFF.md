# Repository Access and Handoff

Repository: [davidlin1521-cmd/figwork-campus-partners](https://github.com/davidlin1521-cmd/figwork-campus-partners)

## Privacy model

Keep the repository private. GitHub does not provide anonymous “anyone with the link can clone” access to a private repository. A person must have a GitHub account and be granted access before cloning. GitHub’s documentation describes inviting collaborators to a private personal repository. [GitHub repository access](https://docs.github.com/en/repositories/creating-and-managing-repositories/access-to-repositories), [inviting collaborators](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)

### Add a collaborator

1. Open the repository on GitHub.
2. Select **Settings**.
3. Open **Collaborators** under Access.
4. Select **Add people**.
5. Invite the person by GitHub username or email.
6. The person accepts the invitation.
7. They clone with GitHub CLI or authenticated HTTPS/SSH:

```bash
gh repo clone davidlin1521-cmd/figwork-campus-partners
```

Do not share a personal access token, deploy key with write access, SSH private key, or GitHub session. If a contractor needs read-only access, move the repository into a GitHub organization where granular repository roles can be managed, then grant the minimum role.

If anonymous link-only cloning is a hard requirement, the repository must be public or the code must be distributed as a separate archive through an approved access-controlled file service. That is a different privacy decision and should not be enabled accidentally.

## Handoff checklist

- [ ] Repository owner and at least one backup administrator are documented.
- [ ] Branch protection requires pull requests and passing checks on `main`.
- [ ] Secret scanning and dependency alerts are enabled.
- [ ] Production secrets exist only in the deployment secret manager.
- [ ] Program, Finance, Trust, Support, Privacy, and Engineering owners are named.
- [ ] All launch-blocking policy decisions in [README.md](./README.md) are signed off.
- [ ] Database migrations and rollback/forward-fix plan are reviewed.
- [ ] Webhook endpoints, signing secrets, rotation procedure, and sandbox/live separation are documented.
- [ ] Dashboards, alerts, queues, DLQs, and on-call routing are provisioned.
- [ ] Stripe test accounts and payout reconciliation pass.
- [ ] Email sending domain, suppression handling, and reply inbox are live.
- [ ] Support macros and appeals are trained.
- [ ] Data retention and deletion workflows are tested.
- [ ] Public page, terms, application, email templates, and effective configuration match.

## Suggested repository protections

For `main`:

- Require one approving review.
- Dismiss stale approvals after new commits.
- Require status checks for typecheck, tests, build, schema validation, secret scan, and migration lint.
- Block force pushes and branch deletion.
- Require signed commits if Figwork policy supports them.
- Restrict production deployment to an environment with required reviewers.

Use CODEOWNERS so Finance/payment files, policy configuration, migrations, and security-sensitive webhook handlers receive the right reviews.
