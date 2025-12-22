# Forge Hello World

This project contains a Forge app written in Javascript that implements a [Dynamic Pipelines](https://support.atlassian.com/bitbucket-cloud/docs/dynamic-pipelines) provider module which modifies a Bitbucket pipeline configuration at runtime when a pipeline is requested to run in Bitbucket Cloud.

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge,
including the [reference for the Dynamic Pipelines provider module type](https://developer.atlassian.com/platform/forge/manifest-reference/modules/bitbucket-dynamic-pipelines-provider)
and the tutorial for this Forge template, [_Orchestrate your builds using Dynamic Pipelines_](https://developer.atlassian.com/platform/forge/orchestrate-your-builds-using-dynamic-pipelines).

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

## Quick start

- Modify your app by editing the `src/index.js` file.

- Build and deploy your app by running:
```
forge deploy
```

- Install your app in a Bitbucket workspace by running:
```
forge install
```

- Develop your app by running `forge tunnel` to proxy invocations locally:
```
forge tunnel
```

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command.

## Support

See [Get help](https://developer.atlassian.com/platform/forge/get-help/) for how to get help and provide feedback.
