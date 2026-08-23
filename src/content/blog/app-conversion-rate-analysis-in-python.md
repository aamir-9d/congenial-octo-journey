---
title: App Conversion Rate Analysis in Python
kicker: Aggregating onboarding and paywall data by device, filtering to completed purchases, and calculating conversion rates per country and payment plan with Pandas.
date: 2024-10-25
tag: Analytics
source: https://www.linkedin.com/pulse/app-onboarding-analysis-revenue-boost-tracking-in-app-aamir-jan-khan-wqutc/
---

In the world of app development, understanding user engagement, particularly in terms of subscription conversions, is key to optimizing product offerings and improving user experience. Here's a step-by-step guide on using Python's Pandas library to aggregate user data, filter based on specific criteria, and calculate conversion rates.

## Loading and preparing the data

> Familiarize yourself with your data. To download it, you can use an SQL or JQL query to retrieve data directly from Mixpanel or Firebase.

Let's start by loading our data, which includes columns like `deviceID`, `countryCode`, `category`, `paymentPlan`, `status`, and `code`. Here's a breakdown of these columns:

- **deviceID** — contains unique IDs for each user device.
- **countryCode** — represents the user's country.
- **category** — groups users into categories based on their app usage.
- **paymentPlan** — details the in-app purchase plan a user has subscribed to.
- **status** — indicates the purchase status, either "done" or "error".
- **code** — includes any error codes that occurred during the purchase process.

> We're working in Jupyter Notebook. If you haven't installed it yet, you can do so by running `pip install jupyter notebook`. We're also using the Pandas library for data analysis, which can be installed with `pip install pandas`.

We'll load the data from a CSV file:

```python
import pandas as pd
df = pd.read_csv('OnboardingPaywallData.csv')
```

## Aggregating data by deviceID

To make each `deviceID` unique, we'll aggregate our data by `deviceID` using a function that converts values to strings and removes null values:

> Skipping null values isn't always necessary. If you'd prefer not to skip them, simply remove `.dropna()` from the code. However, dropping null values can be beneficial for data cleaning and ensuring accurate analysis.

```python
def join_unique_values(series):
    return ', '.join(series.dropna().astype(str).unique())

combinedData = df.groupby('deviceID').agg({
    'countryCode': join_unique_values,
    'category': join_unique_values,
    'paymentPlan': join_unique_values,
    'status': join_unique_values,
    'code': join_unique_values
}).reset_index()
```

## Filtering for successful purchases

> In each code block, make sure to replace placeholder values with your actual data values to ensure accuracy.

Now, let's filter the data to focus only on users who successfully subscribed (where `status` is "done"):

```python
df = combinedData[combinedData['status'].str.contains('done', case=False, na=False)]
```

## Segmenting by payment plans

> "Payment plan" refers to the in-app purchase ID created on the App Store or Play Store.

We'll further segment our filtered data to identify users subscribed to specific payment plans, such as yearly or monthly:

```python
filtered_data_yearly = df[df['paymentPlan'].str.contains('com.yearly', case=False, na=False)]
filtered_data_monthly = df[df['paymentPlan'].str.contains('com.monthly', case=False, na=False)]
```

## Grouping data for conversion analysis

Grouping the data by `countryCode`, `paymentPlan`, and `category`, we'll calculate the number of rows for each unique combination and store it in a new column, `count`:

```python
df1 = df.groupby(['countryCode', 'paymentPlan', 'category']).size().reset_index(name='count')
```

## Calculating total counts by country and payment plan

Next, we'll sum the counts by `countryCode` and `paymentPlan`, creating a `total_count` column that we can use to calculate conversion rates:

```python
total_counts = df1.groupby(['countryCode', 'paymentPlan'])['count'].sum().reset_index()
total_counts.rename(columns={'count': 'total_count'}, inplace=True)
```

## Merging total counts with aggregated data

By merging the total counts back into our aggregated data, we now have both the specific and overall counts for each country and payment plan:

```python
df1 = df1.merge(total_counts, on=['countryCode', 'paymentPlan'])
```

## Calculating conversion rates

With `count` and `total_count` in place, we calculate conversion rates and store them in a new column called `conversion_rate`:

```python
df1['conversion_rate'] = (df1['count'] / df1['total_count']) * 100
```

## Creating a summary DataFrame

```python
df_with_conversion_rates = df1[[
    'countryCode', 'paymentPlan', 'category', 'count', 'total_count', 'conversion_rate'
]]
```

## Conclusion

By analyzing conversion rates by `countryCode`, `paymentPlan`, and `category`, insights emerge about regions or categories with higher engagement that enable targeted strategies for boosting conversions. This methodology provides frameworks for evaluating user behavior patterns and refining growth strategies.
