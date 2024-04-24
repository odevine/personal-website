import { useRoutes } from "raviger";

import { Home, ThemeToggle } from "@/Components";

const routes = {
    "/": () => <Home />,
}

export const App = (): JSX.Element => {
    const route = useRoutes(routes)
    return <>
        <ThemeToggle />
        {route}
    </>
}