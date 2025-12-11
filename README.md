# Trip Tracker

## Setup

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Create Environment File**

    Create a new file `src/environments/environment.ts` and add your Google Maps API Key:

    ```typescript
    export const environment = {
      production: false,
      googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    };
    ```

## Run

Run the application locally:

```bash
  ng serve
```

Navigate to `http://localhost:4200/`.

## Building

To build the project run:

```bash
  ng build
```
![Demo Preview](.github/assets/demo.gif)
