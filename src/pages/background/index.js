chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        case "signInWithGoogle": {
            console.log("listen: ", request);

            // remove any old listener if exists
            chrome.tabs.onUpdated.removeListener(setTokens);
            const url = request.payload.url;
            debugger

            // create new tab with that url
            chrome.tabs.create({ url: url, active: true }, (tab) => {
                // add listener to that url and watch for access_token and refresh_token query string params
                chrome.tabs.onUpdated.addListener(setTokens);
                sendResponse(request.action + " executed");
            });

            break;
        }

        default:
            break;
    }

    return true;
});

const chromeStorageKeys = {
    gauthAccessToken: "gauthAccessToken",
    gauthRefreshToken: "gauthRefreshToken",
};

const setTokens = async (
    tabId,
    changeInfo,
    tab,
) => {
    debugger
    // once the tab is loaded
    if (tab.status === "complete") {
        if (!tab.url) return;
        const url = new URL(tab.url);

        // at this point user is logged-in to the web app
        // url should look like this: https://my.webapp.com/#access_token=xx&expires_in=3600&provider_token=yxxx&token_type=xxx
        // parse access_token and refresh_token from query string params
        console.log('url origin: ', url.origin)
        // const targetUrl = 'https://go-sea-template.vercel.app'
        const targetUrl = import.meta.env.VITE_SITE_URL
        console.log(url.origin === targetUrl);
        if (url.origin === targetUrl) {

            const currentUrl = new URL(url.href);
            const hashParamsString = currentUrl.hash.slice(1);
            const hashParams = new URLSearchParams(hashParamsString);
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");

            console.log(
                `url.href: ${url.href}, url.origin: ${url.origin}, accessToken: ${accessToken}, refreshToken: ${refreshToken}, tab: ${tab}, tabId: ${tabId}`,
            );

            if (accessToken && refreshToken) {
                if (!tab.id) return;

                // we can close that tab now
                // await chrome.tabs.remove(tab.id);

                // store access_token and refresh_token in storage as these will be used to authenticate user in chrome extension
                await chrome.storage.sync.set({
                    [chromeStorageKeys.gauthAccessToken]: accessToken,
                });
                await chrome.storage.sync.set({
                    [chromeStorageKeys.gauthRefreshToken]: refreshToken,
                });

                // remove tab listener as tokens are set
                chrome.tabs.onUpdated.removeListener(setTokens);
                console.log(
                    "background ayuliao save token------------: ",
                    accessToken,
                    refreshToken,
                );
            }
        }
    }
};
