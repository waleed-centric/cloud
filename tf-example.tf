[
    {
        "id": "node-1760977993381-j52fdaded",
        "icon": {
            "id": "s3-bucket",
            "name": "S3 Bucket (dd)",
            "category": "Storage",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🪣</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">S3 Bucket (dd)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 223,
        "y": 209,
        "serviceId": "s3",
        "subServiceId": "s3-bucket",
        "properties": {
            "storageClass": "STANDARD",
            "versioning": false,
            "publicAccess": true,
            "forceDestroy": false,
            "acl": "",
            "acceleration": false,
            "sseAlgorithm": "",
            "kmsKeyId": "",
            "bucketKeyEnabled": false,
            "loggingBucket": "",
            "loggingPrefix": "",
            "corsAllowedOrigins": "*",
            "corsAllowedMethods": "GET,HEAD",
            "corsAllowedHeaders": "*",
            "corsExposeHeaders": "",
            "corsMaxAgeSeconds": 0,
            "websiteIndexDocument": "",
            "websiteErrorDocument": "",
            "bucketName": "dd"
        },
        "isSubService": true,
        "parentNodeId": "node-1760977993380-7f2wsc5zl"
    },
    {
        "id": "node-1760977993381-vr09fsv2h",
        "icon": {
            "id": "s3-lifecycle",
            "name": "Lifecycle Policy (dd)",
            "category": "Storage",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🔄</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">Lifecycle Policy (dd)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 343,
        "y": 209,
        "serviceId": "s3",
        "subServiceId": "s3-lifecycle",
        "properties": {
            "transitionDays": "78",
            "expirationDays": "46",
            "bucketName": "dd"
        },
        "isSubService": true,
        "parentNodeId": "node-1760977993380-7f2wsc5zl"
    }
]