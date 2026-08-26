---
title: 'Mastering JQL in JavaScript: Advanced Analytics with Mixpanel'
kicker: Pulling unique property values, exporting every property of an event, and building a twelve-step onboarding funnel — in Mixpanel's JavaScript Query Language.
date: 2024-10-23
tag: Mixpanel
source: https://www.linkedin.com/pulse/mastering-jql-javascript-advanced-analytics-mixpanel-aamir-jan-khan-poywf/
cta: >-
  JQL will answer whatever you ask it, including questions your event schema cannot actually support. If your Mixpanel numbers do not reconcile with your MMP or your subscription platform, the query is rarely the thing that is wrong.
---

## What is Mixpanel?

Mixpanel is a powerful analytics platform used to track user behavior across web and mobile applications. Like other analytics tools such as Firebase and Google Analytics (GA4), Mixpanel helps businesses gain insights into how users interact with their products.

One of Mixpanel's most powerful features is JQL (JavaScript Query Language), which enables developers to create complex, customized queries that go beyond the default reports. In this article, I'll walk you through the basics of JQL, its syntax, and how to use it to harness the full potential of Mixpanel's data analysis capabilities.

## Understand your event schema

Before diving into JQL, it's essential to have a clear understanding of the event schema your developers have implemented in Mixpanel. This includes knowing all the events being tracked, their associated properties, potential values, and the default properties Mixpanel automatically logs with each event.

## Retrieving all unique values for properties of Mixpanel events

First, select the desired date range. Next, utilize the `filter` function to isolate the specific event name you're interested in. After that, apply the `groupBy` function to extract unique values for the particular property you want to analyze. Finally, use the `map` function to return only the unique values of that property from the grouped result.

```javascript
function main() {
  // Fetch events from the specified date range
  return Events({
    from_date: '2024-01-01',
    to_date: '2024-12-31'
  })
  // Filter for only the 'eventName' events
  .filter(function(event) {
    return event.name === 'eventName'; // replace your actual event here
  })
  // Group by the 'propertyName' property to get unique codes
  // Replace your actual property here
  .groupBy(["properties.propertyName"], mixpanel.reducer.count())
  // Extract the unique values from the grouped result
  .map(function(item) {
    return item.key[0]; // Returns only the unique 'propertyName'
  });
}
```

## Exporting all properties of a specific event for all users

First, select the specific date range for your data extraction. Next, use the `filter` function to specify the event you want to retrieve all data for. Then, in the `groupBy` function, include all the properties in the order you wish them to be grouped and map the output to retrieve essential details for each event occurrence.

```javascript
function main() {
  return Events({
    from_date: '2024-09-22', // replace with your starting date
    to_date: '2024-09-28'    // replace with your ending date
  })
  .filter(function(event) {
    return event.name === 'eventName'; // enter actual event name in 'eventName'
  })

  // grouping all properties of specific event for all users in the mentioned date range
  // we can see that $device_id and mp_country_code are mixpanel default properties

  .groupBy([
    "properties.$device_id",
    "properties.mp_country_code",
    "properties.propertyName1",
    "properties.propertyName2",
    "properties.propertyName3",
    "properties.propertyName4"
  ], mixpanel.reducer.count())
  .map(function(event) {
    return {
      deviceID: event.key[0],
      countryCode: event.key[1],
      property1: event.key[2],
      property2: event.key[3],
      property3: event.key[4],
      property4: event.key[5]

      // in case you have more than 6 properties, add remaining following the same pattern
      // don't forget to include those properties in groupBy function too
    };
  });
}
```

## Creating funnels in Mixpanel

First, select the specific date range for your data extraction. Next, use the `filter` function to include only the events relevant to your funnel analysis, focusing on users from a specific region, such as Canada. Then, implement the `groupByUser` function to evaluate user progress through each step of the defined funnel, incrementing a counter for each completed step. Finally, utilize the `reduce` function to aggregate the data, allowing you to see the total number of users who completed each stage of the funnel. This approach provides valuable insights into user engagement and helps identify any potential bottlenecks in the onboarding process.

> The schema names in quotes are placeholders; be sure to replace them with the predefined schema specific to your app. Before implementing, visualize the funnel you want to track for the user journey, and then set up the appropriate funnel steps to capture that data.

```javascript
// Define the funnel steps that the user needs to complete in order,
// like screens in an onboarding process
var funnel = params.funnel || [
  { event: "User Interaction", screen: "Step 1" },              // First step screen
  { event: "User Interaction", screen: "Step 2" },              // Second step screen
  { event: "User Interaction", screen: "Step 3" },              // Third step screen
  { event: "User Interaction", screen: "Question 1" },          // First question screen
  { event: "User Interaction", screen: "Question 2" },          // Second question screen
  { event: "User Interaction", screen: "Post-Question Video" }, // Video after questions
  { event: "User Interaction", screen: "Subscription Screen" }, // Subscription screen
  { event: "Page View", screen: "Main Dashboard" },             // User views the main dashboard
  { event: "Page View", screen: "Weekly Offer Screen" },        // User sees weekly subscription offer
  { event: "Page View", screen: "Main Dashboard" },             // User back to main dashboard
  { event: "Page View", screen: "Long-term Offer Screen" },     // User sees long-term offer screen
  { event: "Page View", screen: "Main Dashboard" }              // Final return to main dashboard
];

function main() {
  return Events({
    from_date: "2024-09-22",    // Start date of the event data
    to_date: "2024-10-21"       // End date of the event data
  })
  .filter(function(event) {
    // Only include events from users located in Canada (mp_country_code is "CA")
    return event.properties.mp_country_code === "CA";
  })
  .groupByUser(function(steps_completed, events) {
    // Initialize steps completed to zero if undefined
    steps_completed = steps_completed || 0;

    // Iterate over each event for the user
    _.each(events, function(e) {
      // Process only if the user hasn't completed all funnel steps
      if (steps_completed < funnel.length) {
        var currentStep = funnel[steps_completed];

        // Check if the event name and screen match the current funnel step
        // Here screen represents the value of the property as discussed earlier
        if (e.name === currentStep.event &&
           (e.properties["Screen Name"] === currentStep.screen ||
            e.properties["screen info"] === currentStep.screen)) {
          steps_completed++;  // Move to the next step if conditions are met
        }
      }
    });

    return steps_completed;  // Return the number of steps the user completed
  })
  .filter(function(item) {
    // Keep only users who have completed at least one funnel step
    return item.value > 0;
  })
  .reduce(function(accumulators, users_with_final_steps) {
    // Initialize an array to count how many users completed each step
    var funnel_steps = new Array(funnel.length).fill(0);

    // Loop through users and count how many completed each funnel step
    _.each(users_with_final_steps, function(user) {
      for (var i = 0; i < user.value; i++) {
        funnel_steps[i]++;  // Increment step completion count for each step the user completed
      }
    });

    // Combine step completion counts from previous users
    _.each(accumulators, function(accumulator) {
      _.each(accumulator, function(step_count, i) {
        funnel_steps[i] += step_count;  // Add current step count to accumulator
      });
    });

    return funnel_steps;  // Return the final array of step completion counts
  });
}
```

## Notes

1. In the funnel steps above, `screen` represents the values for a specific property. For example, the event we are analyzing, "User Interaction", uses the property "Screen Name", which holds the values for each individual screen view event during onboarding.
2. Refer to the comments in each code snippet for a clearer understanding of how the code works.

## Conclusion

In this article, we explored how to use JQL for retrieving and analyzing event properties, exporting all properties for specific events, and creating funnels that map the user journey. As you work with Mixpanel, remember to tailor the event schema and funnel steps to your unique app, ensuring that the data you collect aligns with your business goals.

Mixpanel, with its powerful analytics capabilities and the flexibility of JQL, allows businesses to dive deep into user behavior and customize their tracking to fit specific needs. By mastering the use of JQL, you can move beyond basic reporting to extract valuable, actionable insights about your users. Whether you're analyzing events, funnel progression, or individual property values, Mixpanel's tools enable you to refine your approach and make data-driven decisions that enhance user experience and product performance.
