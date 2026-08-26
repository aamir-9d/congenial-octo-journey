---
title: 'Leveraging SKAN for iOS: Optimizing Ad Attribution and Tracking'
kicker: How SKAdNetwork records an install, what happens when six ad networks compete for the same one, and how to receive a copy of the winning postback on your own server.
date: 2024-10-24
tag: SKAdNetwork
source: https://www.linkedin.com/pulse/leveraging-skan-ios-optimizing-ad-attribution-tracking-aamir-jan-khan-6bikf/
cta: >-
  A SKAN schema is not portable between apps. A subscription app keys its fine values to funnel position; a game keys them to revenue buckets; and a schema copied from one into the other wastes the signal completely. If yours was inherited rather than designed, that is worth an hour.
---

In the evolving landscape of iOS advertising, Apple's SKAdNetwork (SKAN) and App Tracking Transparency (ATT) have redefined how advertisers track and measure campaign success. Leveraging SKAN's capabilities is essential for accurate ad attribution, ensuring your app maximizes its marketing potential while respecting user privacy.

## How SKAN records ad attribution

**Ad attribution steps**

- **User watches an ad:** When a user views an ad.
- **User downloads the app:** The advertised app is downloaded.
- **Install attribution:** Now, the ad impression is eligible for install attribution.
- **Conversion value updates:** As the user engages with the app, the app updates the conversion value. Starting with iOS 16.1 and SKAN 4.0, conversion values can be updated during three conversion windows (e.g. app install, engagement with the app, etc.)

**Function to update conversion value**

```swift
updatePostbackConversionValue(_:coarseValue:lockWindow:completionHandler:)
```

> Postbacks are sent to the ad network and can be received on the developer's end.

## How SKAN works with multiple ad networks competing

Suppose six ad networks are competing for a specific ad:

- **Meta:** contains the winning ad we advertised; SKAN SDK parameter `did-win=True`
- **Other networks** (AppLovin, Google Ads, Mintegral, Pangle, InMobi): all have `did-win=False`

In SKAN 4.0 and later, a maximum of five postbacks with `did-win=False` are sent for losing networks, along with one `did-win=True` postback for the winning network.

## SKAdNetwork ad types

1. **Store-kit rendered ads:** app store product page is displayed
2. **View through ads:** ad network presents ad in any format and records ad impression
3. **Attributable web ads:** ads presented on the Safari page

Parameters used by the SKAN SDK to differentiate between these ads are provided as follows:

1. Store-kit rendered ads: parameter `fidelity-type: 1`
2. View through ads: parameter `fidelity-type: 0`
3. Attributable web ads: parameter `fidelity-type: 1`

> Cryptographically signed ads include campaign identifiers in the install-validation postbacks, allowing MMPs to track campaign IDs for each user from specific ads.

## Receiving copies of winning install validation postbacks

This allows developers to independently verify ad network performance and prevent discrepancies directly. To receive postbacks, add the `NSAdvertisingAttributionReportEndpoint` key in your app's `Info.plist` file and configure your server:

1. Open `Info.plist` in Xcode.
2. Add `NSAdvertisingAttributionReportEndpoint` as a new key.
3. Set the type to String and enter your server's URL, formatted like `https://yourdomain.com`.

**NSAdvertisingAttributionReportEndpoint**

The URL where Private Click Measurement (PCM) and SKAdNetwork send attribution data. String type value containing a valid domain name URL in the format `https://example.com`.

## Configuring your server to receive postbacks

To receive HTTPS POST messages at designated endpoints:

- **PCM event attribution data:** `https://yourdomain.com/.well-known/private-click-measurement/report-attribution/`
- **SKAdNetwork install validation postbacks:** `https://yourdomain.com/.well-known/skadnetwork/report-attribution/`

Replace `yourdomain.com` with your valid domain name. Only the registrable part of the domain name is used, ignoring any subdomains.

## Receiving postbacks in multiple conversion windows

SKAN allows updating conversion values across multiple windows, providing greater flexibility in tracking user engagement.

## Private Click Measurement — PCM

**Web-to-web click measurement**

The PCM report is in JSON and looks like this:

```json
{
  "source_engagement_type": "click",
  "source_site": "social.example",
  "source_id": "[8-bit source ID]",
  "attributed_on_site": "shop.example",
  "trigger_data": "[4-bit trigger data]",
  "version": 1
}
```

1. `source_engagement_type` — is always "click" for PCM
2. `source_site` — website where the ad is being shown
3. `source_id` — campaign id
4. `attributed_on_site` — product page
5. `trigger_data`
6. `version`

## How MMPs can reduce your ad spend by preventing ad fraud

Mobile Measurement Partners (MMPs) offer critical insights into which networks genuinely contribute to installs, helping reduce wasted ad spend. By accurately attributing installs to the correct ad network, MMPs expose ad networks that falsely claim user acquisition. This allows you to reclaim spent budgets by flagging fraudulent claims and improving ROI by preventing future ad fraud. Alternatively, if you receive a copy of the postback on your server, you can parse it to validate which ad networks truly contributed to the acquisition, helping you to monitor for any discrepancies directly.

## Conclusion

Mastering SKAN empowers advertisers to stay competitive in the iOS ecosystem. By optimizing ad attribution and aligning with privacy standards, you can drive meaningful results while building trust with users and preventing ad fraud.
