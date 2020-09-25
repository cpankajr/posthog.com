import { kea } from 'kea'

export const featureFlagLogic = kea({
    actions: {
        posthogFound: (posthog) => ({ posthog }),
        setFeatureFlags: (featureFlags) => ({ featureFlags }),
    },

    reducers: {
        featureFlags: [
            {},
            {
                setFeatureFlags: (state, { featureFlags }) => {
                    const flags = {}
                    for (const flag of featureFlags) {
                        flags[flag] = true
                    }
                    return flags
                },
            },
        ],
    },

    listeners: ({ actions }) => ({
        posthogFound: ({ posthog }) => {
            posthog.onFeatureFlags(actions.setFeatureFlags)
        },
    }),

    events: ({ actions, cache }) => ({
        afterMount: () => {
            if (window.posthog) {
                actions.posthogFound(window.posthog)
            } else {
                // check every 300ms if posthog is now there
                cache.posthogInterval = window.setInterval(() => {
                    if (window.posthog) {
                        actions.posthogFound(window.posthog)
                        window.clearInterval(cache.posthogInterval)
                    }
                }, 300)
            }
        },
        beforeUnmount: () => {
            window.clearInterval(cache.posthogInterval)
        },
    }),
})
