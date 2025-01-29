# Swell Forecast Card

<p align="center">
  <img src="https://raw.githubusercontent.com/mrvautin/lovelace-swell-forecast-card/refs/heads/main/dist/logo.png" height="150px" />
</p>

This project provides a Home Assistant HACS card for the [Swell Forecast](https://github.com/mrvautin/hacs-beach-swell-forecast) integration.

<p align="center">
  <img src="https://raw.githubusercontent.com/mrvautin/lovelace-swell-forecast-card/refs/heads/main/dist/screenshot.png" height="200px" />
</p>

## Installation

- In `HACS` > `3 dots` > `Custom Repositories`.
- In `Repository` add: `https://github.com/mrvautin/lovelace-swell-forecast-card`
- In `Type` select `Dashboard`
- Click `Add`

## Usage

Create a new card, in `Search cards` type enter `Custom` and select `Custom: Swell Forecast Card`.

You will then want to enter the following `yaml` ensuring you change the `title` and your sensor `entities`.

``` yaml
type: custom:swell-forecast-card
title: Southport Beach, SA
current: sensor.<location_name>_current
scale: face
entities:
  - sensor.<location_name>_day1_forecast
  - sensor.<location_name>_day2_forecast
  - sensor.<location_name>_day3_forecast
  - sensor.<location_name>_day4_forecast
  - sensor.<location_name>_day5_forecast
```

`type` = Must be set to `custom:swell-forecast-card`
`title` = The title for the card. Optional.
`current` = The sensor for the current conditions. Optional.
`scale`: Can be either `face` or `douglas`. Optional: Defaults to `face`
`entities` = An array of sensors you want to display the forecast for. Max 5 entities

## Scale types

There are a few scales to determine a wave size. Swell forecast supports `face` and `douglas` scale. 

`Face` scale is a relative scale to a general humans height. 
`Douglas` scale is a descriptive scale based on the wave height.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.