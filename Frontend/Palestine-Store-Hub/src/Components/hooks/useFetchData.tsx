import { useEffect, useState } from 'react';
import axios from 'axios';

const useFetchData = (url: string) => {

  const [data, setData] = useState<any>(null); //I used <any> becasue we dont know the type of data 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  //function to fetch data
  const fetchData = async () => {
    try {
      const response = await axios.get(url);
      setData(response.data); //store the response data
    } catch (err: any) {
      setError(err); //store the error
    } finally {
      setLoading(false); //stop loading regardless of success or failure
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]); //fetchData() will runs when the `url` changes

  return { data, loading, error }; //return an object containing data,loading,error 
};

export default useFetchData;
