# Property Environmental Risk Checker

A new utility app added to the Ship Rekt Games collection that allows users to check environmental risks and hazards near any property address.

## Features

- **Address Geocoding**: Convert property addresses to coordinates using OpenStreetMap Nominatim API
- **Environmental Data**: Mock EPA database search for nearby facilities and hazards (ready for real API integration)
- **AI Analysis**: Simulated AI-powered summaries of environmental risks (ready for OpenAI integration)
- **Search History**: Track and review previous property risk assessments
- **Export Functionality**: Download search history as JSON for records

## How It Works

1. **Enter Address**: Input any property address (city and state/country required)
2. **Geocoding**: Address is converted to latitude/longitude coordinates
3. **Data Collection**: System searches for nearby environmental facilities and hazards
4. **AI Summary**: Plain-English risk report is generated
5. **Results Display**: View comprehensive risk assessment with technical details

## Demo

Try the demo search with "Love Canal, Niagara Falls, NY 14304" - a well-known EPA Superfund site that will demonstrate the environmental risk detection features.

## API Integration Ready

The app is structured to easily integrate with real APIs:

- **Geocoding**: Currently uses free OpenStreetMap Nominatim API
- **EPA Data**: Ready for EPA Envirofacts API integration (currently uses mock data)
- **AI Summaries**: Ready for OpenAI API integration (currently uses mock responses)
- **Additional Sources**: Prepared for FCC towers, USGS water data, and other environmental databases

## Technical Details

- Built with vanilla JavaScript following the existing app architecture
- Uses the same user system for progress saving and history tracking
- Fully responsive design optimized for mobile devices
- Follows existing UI patterns and styling conventions
- Integrated with the main game menu system

## Future Enhancements

- Real-time API integrations
- Interactive maps showing hazard locations
- PDF report generation
- Advanced filtering and search options
- Risk scoring algorithms
- Notification system for high-risk areas