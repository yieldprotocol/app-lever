import React from 'react'
import useSWR from 'swr';


const fetcher = (url:string) => fetch(url).then((res) => res.json());

const IpBlocker = (props: any) =>  {

    const { data, error } = useSWR(
        `https://geo.ipify.org/api/v2/country?apiKey=${process.env.IPIFY_KEY}_disabled`,
        // `https://geo.ipify.org/api/v2/country?apiKey=${process.env.IPIFY_KEY}`,
        fetcher
      );
      // if (error) return "An error has occurred.";
  
        data && console.log( 'ip address: ', data.ip, ' - location: ', data.location.country  )

      return (
        <div>
            {props.children}    
        </div>
      );
}

export default IpBlocker;

/** ouput example
{
    "ip": "8.8.8.8",
    "location": {
        "country": "US",
        "region": "California",
        "timezone": "-07:00",
    },
    "domains": [
        "0d2.net",
        "003725.com",
        "0f6.b0094c.cn",
        "007515.com",
        "0guhi.jocose.cn"
    ],
    "as": {
        "asn": 15169,
        "name": "Google LLC",
        "route": "8.8.8.0/24",
        "domain": "https://about.google/intl/en/",
        "type": "Content"
    },
    "isp": "Google LLC"
}
*/