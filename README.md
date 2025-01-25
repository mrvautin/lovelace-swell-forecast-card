# Swell Forecast Card

<p align="center">
  <img src="https://raw.githubusercontent.com/mrvautin/lovelace-swell-forecast-card/refs/heads/main/dist/logo.png" height="150px" />
</p>

This project provides a Home Assistant HACS card for the [Swell Forecast](https://github.com/mrvautin/hacs-beach-swell-forecast) integration.

## Installation

- In `HACS` > `3 dots` > `Custom Repositories`.
- In `Repository` add: `https://github.com/mrvautin/lovelace-swell-forecast-card`
- In `Type` select `Dashboard`
- Click `Add`

## Usage

Create a new card, in `Search cards` type enter `Custom` and select `Custom: Swell forecast card`.

You will then want to enter the following `yaml` ensuring you change the `title` and your sensor `entities`.

``` yaml
type: custom:swell-forecast-card
title: Kirra Beach
entities:
  - sensor.<location_name>_day1_forecast
  - sensor.<location_name>_day2_forecast
  - sensor.<location_name>_day3_forecast
  - sensor.<location_name>_day4_forecast
  - sensor.<location_name>_day5_forecast
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.