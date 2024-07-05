import { getSupabaseAuthInfo } from "../../compoents/supabaseClient"

export default function Pricing() {

    async function goPricing() {

        const authInfo = await getSupabaseAuthInfo()
        const access_token = authInfo.gauthAccessToken
        const refresh_token = authInfo.gauthRefreshToken
        const price = 'price_1NHPqbJ82ghomF5cZei4dh6f'
        const product = 'prod_O3WunFd23o8DWJ'

        try {
            // access_token: access_token,
            // refresh_token: refresh_token,
            // http://localhost:3000/web-extension-pricing
            const url = import.meta.env.VITE_SITE_URL + `/web-extension-pricing?access_token=${access_token}&refresh_token=${refresh_token}&price=${price}&product=${product}`
            await chrome.tabs.create({ url: url, active: true });

        } catch (error) {
            console.log("go pricing web error: ", error);
        }
    }



    return (
        <div className="mx-auto max-w-xs px-8">
            <p className="text-base font-semibold text-gray-600">
                {chrome.i18n.getMessage('payonce')}
            </p>
            <p className="mt-6 flex items-baseline justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-gray-900">$19</span>
                <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD</span>
            </p>
            <button
                className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"

                onClick={goPricing}
            >
                Get access
            </button>
            <p className="mt-6 text-xs leading-5 text-gray-600">
                Invoices and receipts available for easy company reimbursement
            </p>
        </div>

    )
}
