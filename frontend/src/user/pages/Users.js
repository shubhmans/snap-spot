import React, { useEffect, useState } from "react";
import UserList from "../components/UsersList";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState();
    // Don't use async in the useEffect function, because it will treat all function as promise
    //so this should be avoided
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    process.env.REACT_APP_BACKEND_URL + "/api/users"
                );
                // Order will be maintained
                setLoadedUsers(responseData.users);
            } catch (err) {}
        };

        fetchUsers();
    }, [sendRequest]);

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {!isLoading && loadedUsers && <UserList items={loadedUsers} />}
        </>
    );
};

export default Users;
