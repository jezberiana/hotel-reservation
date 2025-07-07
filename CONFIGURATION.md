# Hotel Reservation Configuration

This application uses JSON configuration files to easily customize hotel information, room types, and pricing. Here's how to modify them:

## Configuration Files

### 1. Hotel Configuration (`src/data/hotelConfig.json`)

This file contains basic hotel information and service pricing:

```json
{
  "hotel": {
    "name": "LuxuryStay Hotel",
    "tagline": "Choose your perfect room and book your stay",
    "icon": "🏨",
    "brand": "Hotel Marketplace"
  },
  "servicePrices": {
    "breakfast": 1400,
    "parking": 850,
    "wifi": 560,
    "spa": 4200
  },
  "currency": {
    "symbol": "₱",
    "code": "PHP",
    "name": "Philippine Peso"
  }
}
```

**How to modify:**
- Change `hotel.name` to your hotel's name
- Update `hotel.tagline` with your marketing message
- Replace `hotel.icon` with any emoji or remove it
- Adjust `servicePrices` values based on your pricing (in your local currency)
- Update `currency` object for your local currency

### 2. Room Types (`src/data/roomTypes.json`)

This file defines all available room types and their details:

```json
{
  "standard": {
    "name": "Standard Room",
    "price": 6800,
    "description": "Comfortable room with essential amenities",
    "features": ["Free WiFi", "Air Conditioning", "Private Bathroom", "City View"],
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    "maxGuests": 2
  }
}
```

**How to modify:**
- Add new room types by adding new objects with unique keys
- Change `name` to your room type name
- Update `price` in your local currency
- Modify `description` to match your room
- Update `features` array with actual amenities
- Replace `image` URL with your room photos
- Set `maxGuests` to the actual capacity

## Example: Adding a New Room Type

To add a "Family Room" option, add this to `roomTypes.json`:

```json
{
  "family": {
    "name": "Family Room",
    "price": 12500,
    "description": "Spacious room perfect for families with children",
    "features": ["Two Queen Beds", "Mini Fridge", "Game Console", "Kid-Friendly Amenities"],
    "image": "https://your-image-url.com/family-room.jpg",
    "maxGuests": 5
  }
}
```

## Example: Changing Currency

To change from Philippine Peso to US Dollar, update `hotelConfig.json`:

```json
{
  "currency": {
    "symbol": "$",
    "code": "USD",
    "name": "US Dollar"
  },
  "servicePrices": {
    "breakfast": 25,
    "parking": 15,
    "wifi": 10,
    "spa": 75
  }
}
```

## Notes

- After making changes, restart the development server for changes to take effect
- All prices should be in the same currency as defined in the currency configuration
- Image URLs should be publicly accessible
- Features array can contain any number of amenities
- Room type keys (like "standard", "deluxe") should be unique and URL-friendly (no spaces)
