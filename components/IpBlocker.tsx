import React from 'react';
import useSWR from 'swr';
import Modal from './common/Modal';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const blockedCodes = ['US'];

const IpBlocker = (props: any) => {
  const { data, error } = useSWR(
    // `https://geo.ipify.org/api/v2/country?apiKey=${process.env.IPIFY_KEY}_disabled`,
    `https://geo.ipify.org/api/v2/country?apiKey=${process.env.IPIFY_KEY}`,
    fetcher
  );

  return (
    <>
      { (error || data?.location === undefined) && (
        <Modal isOpen={true} setIsOpen={() => null}>
          <div className="space-y-4">
            <div className="text-lg text-white">The use of this dApp is restricted in some regions.</div>
            <div className="text-xs text-white">
              We could not definatively determine your location. Please turn off any VPNs or location mocking deivces.
              If you are still experiencing issues, please contact support.
            </div>
          </div>
        </Modal>
      )}
      {data?.location && blockedCodes.includes(data.location.country ) && (
        <Modal isOpen={true} setIsOpen={() => null}>
          <div className="text-lg text-white">Sorry, this dApp is not available in your country yet.</div>
        </Modal>
      )}
      {data?.location && !blockedCodes.includes(data.location.country) && <div>{props.children}</div>}
    </>
  );
};

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
