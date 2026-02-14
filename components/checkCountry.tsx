import { useEffect, useState } from "react";

const CheckCountry = () => {
  const [userCountry, setUserCountry] = useState("");

  const fetchUserCountry = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      const userIP = data.ip;

      const countryResponse = await fetch(`https://ipapi.co/${userIP}/country/`);
      const country = await countryResponse.text();
      console.log("counryyyyyy", countryResponse);
      setUserCountry(country);
    } catch (error) {
      console.error("Error fetching user country:", error);
    }
  };

  useEffect(() => {
    fetchUserCountry();
  }, []); // Fetch user country once when the component mounts

  return (
    <>
      <p>User's Country: {userCountry}</p>
    </>
  );
};

export default CheckCountry;
