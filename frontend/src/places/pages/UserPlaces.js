import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const UserPlaces = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedPlaces, setLoadedPlaces] = useState([]);
    const userId = useParams().userId;
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/api/places/user/${userId}`
                );
                setLoadedPlaces(responseData.places);
            } catch (err) {}
        };

        fetchPlaces();
    }, [sendRequest, userId]);

    const placeDeleteHandler = (deletedPid) => {
        setLoadedPlaces((prevPlaces) =>
            prevPlaces.filter((p) => p.id !== deletedPid)
        );
    };
    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}
            {!isLoading && (
                <PlaceList
                    items={loadedPlaces}
                    onDeletePlace={placeDeleteHandler}
                />
            )}
        </>
    );
};

export default UserPlaces;
