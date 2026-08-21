# Repository Access and Handoff

Repository: [davidlin1521-cmd/figwork-campus-partners](https://github.com/davidlin1521-cmd/figwork-campus-partners)

## Access model

The repository is public so the Figwork handoff team can view and clone it without individual GitHub invitations:

```bash
git clone https://github.com/davidlin1521-cmd/figwork-campus-partners.git
```

Public visibility does not grant write access. Repository administrators still control who can push, merge, change settings, or deploy. No open-source license is included, so publishing the source does not by itself grant reuse rights outside Figwork.

If the repository later needs to become private, move it into the Figwork GitHub organization and grant access through teams rather than shared credentials. Never share a personal access token, SSH private key, deploy credential, or signed-in GitHub session.

## Handoff checklist

- [ ] Repository is transferred to the Figwork GitHub organization or has at least two documented administrators.
- [ ] Branch protection requires pull requests and passing checks on `main`.
- [ ] Secret scanning and dependency alerts are enabled.
- [ ] Production secrets exist only in the deployment secret manager.
- [ ] Program, Finance, Trust, Support, Privacy, and Engineering owners are named.
- [ ] All launch-blocking policy decisions in [README.md](./README.md) are signed off.
- [ ] Database migrations and rollback/forward-fix plan are reviewed.
- [ ] Webhook endpoints, signing secrets, rotation procedure, and sandbox/live separation are documented.
- [ ] Monitoring, failed-job visibility, alerts, and an engineering escalation route are ready.
- [ ] Payment-provider test accounts and payout reconciliation pass.
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

## Ownership transfer

Recommended final handoff:

1. Create or select the official Figwork GitHub organization.
2. Transfer the repository from the personal account to that organization.
3. Create Engineering, Program Operations, Finance, Legal/Privacy, and read-only stakeholder teams.
4. Apply least-privilege access and branch protections.
5. Reconnect deployment through an organization-owned integration.
6. Rotate any personal deployment credentials after the organization-owned path succeeds.
7. Record the owning team, on-call rotation, and escalation contacts in the repository.
