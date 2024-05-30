import {useCallback, useEffect, useState} from "react";
import axios from "axios";

const useFetch = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(process.env.REACT_APP_API_URL + url);
            setData(res.data);
            return res.data; // Return the fetched data
        } catch (error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [url]);

    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {data, loading, error, refetch};
};

export default useFetch;