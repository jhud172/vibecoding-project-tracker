# Connecting a student repository to the hackathon portal

Verified with James's account on 20 October 2026.

## Student setup

1. Sign in to GitHub and fork the [course starter](https://github.com/ignacioalvmar/vibecoding-project-tracker) into your own account.
2. Open the [hackathon dashboard](https://vc-hackathon-hub.vercel.app/dashboard) and choose **Login with GitHub**. Complete GitHub's sign-in/authorisation flow.
3. In **Connect your Repository**, paste your fork's normal web URL, such as `https://github.com/YOUR-USERNAME/vibecoding-project-tracker`. Save it and check **Repo Connected**. Use the fork, not the lecturer's original repository, a branch URL, or a clone URL ending in `.git`.
4. In your fork on GitHub, open **Settings → Webhooks → Add webhook**.
5. Complete GitHub's **Confirm access** verification if requested. Students approve their own GitHub Mobile or other verification prompts.
6. Enter the settings below, then add the webhook.

| Setting | Value |
|---|---|
| Payload URL | `https://vc-hackathon-hub.vercel.app/api/webhooks/github` |
| Content type | `application/json` |
| Events | Just the push event |
| SSL verification | Enable SSL verification |
| Active | Checked |
| Secret | Use the lecturer's configured value, if supplied; see the note below |

James's verified setup used a blank secret because none was supplied. For a class-wide rollout, the lecturer should confirm the portal's webhook-secret configuration and tell students the matching setup privately. Do not invent a different secret or publish one in a repository.

## Verify the connection

Clone your fork or point your existing local repository's `origin` at it. After configuring the webhook, push a new commit containing `git-linked`:

```sh
git commit --allow-empty -m "git-linked: verify portal connection"
git push origin main
```

Refresh the dashboard. **Link your Github** should show the commit and a completion time, and the next milestone should become **Complete the PRD**.

Saving the repository URL alone did not complete this verification in James's setup. A real push after webhook creation did.

## Recording subsequent work

When a milestone's work is actually finished and checked, include its exact identifier in the commit message, then push. For example:

```sh
git add PRD.md
git commit -m "prd-done: complete project requirements"
git push origin main
git tag prd-done
git push origin prd-done
```

The portal processes **commit messages** from push events. Git tags also satisfy the starter's documented workflow, but pushing a tag alone is not a substitute for the milestone commit.

The identifiers observed in the live dashboard are:

1. `git-linked`
2. `prd-done`
3. `design-done`
4. `data-model`
5. `crud-modal`
6. `tag-style`
7. `task-owner`
8. `due-tint`
9. `task-context`
10. `copy-context`
11. `project-deliverables`
12. `secret-sauce`
13. `pitch-done`

Some starter identifiers differ. Follow the current dashboard's identifiers for tracking, and the PRD for the required work. A milestone identifier records completed work; it does not perform or verify that work automatically.

## If a milestone does not appear

- Check that the saved repository URL exactly identifies the fork receiving the push.
- Check that the webhook is active, uses JSON, and sends push events to the endpoint above.
- Open the webhook's **Recent Deliveries** and inspect the actual push delivery and response. An initial ping is not evidence that a milestone commit was processed.
- Check the pushed commit message for the exact identifier.
- Commits pushed before the webhook existed are not automatically resent by adding it. Push a new milestone-verification commit once the associated work is complete.
- Check `git remote -v` to ensure pushes go to your fork.

No personal access token was needed for James's browser setup. GitHub sign-in, repository registration and push notifications are separate parts of the connection.

Portal implementation reference: [course portal repository](https://github.com/ignacioalvmar/vc_hackathon_hub).
