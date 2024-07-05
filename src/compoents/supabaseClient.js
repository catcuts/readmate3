import { createClient, User } from "@supabase/supabase-js";


export const supabase = createClient(
    import.meta.env.VITE_PUBLIC_SUPABASE_URL,
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

const chromeStorageKeys = {
    gauthAccessToken: "gauthAccessToken",
    gauthRefreshToken: "gauthRefreshToken",
};

export async function signInWithGoogle() {
    // const redirectTo = "https://go-sea-template.vercel.app";
    const redirectTo = import.meta.env.VITE_SITE_URL + '/web-extension-auth'
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: redirectTo,
            skipBrowserRedirect: true,
        },
    });
    console.log("sing google error: ", error);
    console.log('data: ', data)
    console.log('error: ', error)
    debugger
    try {
        // tell background service worker to create a new tab with that url
        await chrome.runtime.sendMessage({
            action: "signInWithGoogle",
            payload: { url: data.url }, // url is something like: https://[project_id].supabase.co/auth/v1/authorize?provider=google
        });
        console.log("chrome send: ", data.url);
    } catch (error) {
        console.log("chrome send error: ", error);
    }
}

export async function getSupabaseAuthInfo() {
    const gauthAccessToken = (
        await chrome.storage.sync.get(chromeStorageKeys.gauthAccessToken)
    )[chromeStorageKeys.gauthAccessToken];
    const gauthRefreshToken = (
        await chrome.storage.sync.get(chromeStorageKeys.gauthRefreshToken)
    )[chromeStorageKeys.gauthRefreshToken];
    return {
        gauthAccessToken: gauthAccessToken,
        gauthRefreshToken: gauthRefreshToken
    }
}


export async function getCurrentUser() {
    const authInfo = await getSupabaseAuthInfo()
    const gauthAccessToken = authInfo.gauthAccessToken
    const gauthRefreshToken = authInfo.gauthRefreshToken
    console.log(gauthAccessToken, gauthRefreshToken);

    if (gauthAccessToken && gauthRefreshToken) {
        try {
            // set user session from access_token and refresh_token
            const resp = await supabase.auth.setSession({
                access_token: gauthAccessToken,
                refresh_token: gauthRefreshToken,
            });

            const user = resp.data?.user;
            const supabaseAccessToken = resp.data.session?.access_token;

            if (user && supabaseAccessToken) {
                return { user, accessToken: supabaseAccessToken };
            }
        } catch (e) {
            console.error("Error: ", e);
        }
    }

    return null;
}