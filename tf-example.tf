[
    {
        "id": "node-1761063979525-2jwkriujy",
        "icon": {
            "id": "ec2-instance",
            "name": "EC2 Instance (pehla)",
            "category": "Compute",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🖥️</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">EC2 Instance (pehla)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 59,
        "y": 90,
        "serviceId": "ec2",
        "subServiceId": "ec2-instance",
        "properties": {
            "instanceType": "t2.micro",
            "ami": "ami-0abcdef1234567890",
            "keyPair": "",
            "name": "pehla"
        },
        "isSubService": true,
        "parentNodeId": "node-1761063979525-czvdirp7b"
    },
    {
        "id": "node-1761063979525-kl1ckfiov",
        "icon": {
            "id": "ebs-volume",
            "name": "EBS Volume (pehla)",
            "category": "Compute",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">💾</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">EBS Volume (pehla)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 179,
        "y": 90,
        "serviceId": "ec2",
        "subServiceId": "ebs-volume",
        "properties": {
            "volumeType": "gp3",
            "size": 20,
            "encrypted": false,
            "name": "pehla"
        },
        "isSubService": true,
        "parentNodeId": "node-1761063979525-czvdirp7b"
    },
    {
        "id": "node-1761063979525-27ehrzls0",
        "icon": {
            "id": "security-group",
            "name": "Security Group (pehla)",
            "category": "Compute",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🛡️</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">Security Group (pehla)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 299,
        "y": 90,
        "serviceId": "ec2",
        "subServiceId": "security-group",
        "properties": {
            "groupName": "default-sg",
            "inboundRules": "",
            "name": "pehla"
        },
        "isSubService": true,
        "parentNodeId": "node-1761063979525-czvdirp7b"
    },
    {
        "id": "node-1761063993140-t6fydrvil",
        "icon": {
            "id": "ec2-instance",
            "name": "EC2 Instance (dusra)",
            "category": "Compute",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🖥️</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">EC2 Instance (dusra)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 195,
        "y": 498,
        "serviceId": "ec2",
        "subServiceId": "ec2-instance",
        "properties": {
            "instanceType": "t2.micro",
            "ami": "ami-0abcdef1234567890",
            "keyPair": "",
            "name": "dusra"
        },
        "isSubService": true,
        "parentNodeId": "node-1761063993139-cjumfpoeg"
    },
    {
        "id": "node-1761063993140-a7qfi1tvm",
        "icon": {
            "id": "ebs-volume",
            "name": "EBS Volume (dusra)",
            "category": "Compute",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">💾</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">EBS Volume (dusra)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 315,
        "y": 498,
        "serviceId": "ec2",
        "subServiceId": "ebs-volume",
        "properties": {
            "volumeType": "gp3",
            "size": 20,
            "encrypted": false,
            "name": "dusra"
        },
        "isSubService": true,
        "parentNodeId": "node-1761063993139-cjumfpoeg"
    },
    {
        "id": "node-1761063993140-mzozoxsy2",
        "icon": {
            "id": "security-group",
            "name": "Security Group (dusra)",
            "category": "Compute",
            "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🛡️</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">Security Group (dusra)</text>\n        </svg>",
            "width": 50,
            "height": 50
        },
        "x": 435,
        "y": 498,
        "serviceId": "ec2",
        "subServiceId": "security-group",
        "properties": {
            "groupName": "default-sg",
            "inboundRules": "",
            "name": "dusra"
        },
        "isSubService": true,
        "parentNodeId": "node-1761063993139-cjumfpoeg"
    }
]