import React, { Suspense } from "react";
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from "react-router-dom";

import MainNavigation from "./shared/components/Navigation/MainNavigation";

import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";
import LoadingSpinner from "./shared/components/UIElements/LoadingSpinner";

// Lazily load the user's route, this is called react splitting which helps to minimize
// the size and helps to reduce time
const Users = React.lazy(() => import("./user/pages/Users"));
const NewPlace = React.lazy(() => import("./places/pages/NewPlace"));
const UserPlaces = React.lazy(() => import("./places/pages/UserPlaces"));
const UpdatePlace = React.lazy(() => import("./places/pages/UpdatePlace"));
const Auth = React.lazy(() => import("./user/pages/Auth"));

const App = () => {
    const { token, login, logout, userId } = useAuth();
    let routes;
    if (token) {
        routes = (
            <Switch>
                <Route path="/" exact>
                    <Users />
                </Route>
                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>
                <Route path="/places/new" exact>
                    <NewPlace />
                </Route>
                {/* Order matters here, for new and update due to pattern */}
                <Route path="/places/:placeId" exact>
                    <UpdatePlace />
                </Route>
                {/* From top to bottom if no suitable path is found, redirect to / */}
                <Redirect to="/" />
            </Switch>
        );
    } else {
        routes = (
            <Switch>
                {/* alternaively we can specify the component name in the props of Route tag */}
                <Route path="/" exact>
                    <Users />
                </Route>
                <Route path="/:userId/places" exact>
                    <UserPlaces />
                </Route>
                <Route path="/auth" exact>
                    <Auth />
                </Route>
                <Redirect to="/auth" />
            </Switch>
        );
    }
    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!token,
                token: token,
                userId: userId,
                login: login,
                logout: logout,
            }}
        >
            <Router>
                <MainNavigation />
                <main>
                    <Suspense
                        fallback={
                            <div className="center">
                                <LoadingSpinner />
                            </div>
                        }
                    >
                        {/* With switch, the parsing of further routes is stopped if matching is found */}
                        {routes}
                    </Suspense>
                </main>
            </Router>
        </AuthContext.Provider>
    );
};

export default App;
