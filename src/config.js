
// Configuration based on DOM analysis
export const CONFIG = {
    // Selectors based on actual DOM analysis
    selectors: {
        minBid: '.detail__minbid .Bidding_Listing_MinPrice .NumberPart',
        minBidContainer: '.detail__minbid',
        delivery: [
            '.shipping-table td',
            '.table.shipping-table tbody tr td:last-child'
        ],
        container: '.form-group',
        priceContainer: '.detail__minbid'
    },
    
    // Text patterns for extracting prices
    patterns: {
        currency: /£?([\d,]+(?:\.\d{2})?)/g,
        minBidText: /minimum\s+bid/i,
        deliveryText: /delivery|shipping|postage|transport/i
    },
    
    // Display configuration
    display: {
        finalPriceClass: 'johnpye-final-price',
        containerClass: 'johnpye-price-container',
        styles: {
            container: {
                margin: '10px 0',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                border: '2px solid #28a745',
                borderRadius: '6px',
                fontFamily: 'Arial, sans-serif'
            },
            label: {
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#28a745',
                marginRight: '8px'
            },
            price: {
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#dc3545'
            },
            breakdown: {
                fontSize: '14px',
                color: '#6c757d',
                marginTop: '4px'
            },
            breakdownItem: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2px 0',
                borderBottom: '1px solid #e9ecef'
            },
            breakdownLabel: {
                flex: '1',
                textAlign: 'left'
            },
            breakdownValue: {
                fontWeight: 'bold',
                textAlign: 'right',
                minWidth: '80px'
            }
        }
    }
};
