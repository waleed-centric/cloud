[
    {
        "name": "EC2 Instance (MyEC2Instance)",
        "services": [
            "ec2-instance",
            "ebs-volume",
            "security-group"
        ],
        "properties": {
            "instanceType": "t2.micro",
            "ami": "ami-0abcdef1234567890",
            "keyPair": "",
            "name": "MyEC2Instance",
            "volumeType": "gp3",
            "size": 20,
            "encrypted": false,
            "groupName": "default-sg",
            "inboundRules": "",
            "securityGroups": [
                "web-sg"
            ]
        },
        "nodes": [
            {
                "id": "node-1761042258983-kqra4iwrh",
                "icon": {
                    "id": "ec2-instance",
                    "name": "EC2 Instance (MyEC2Instance)",
                    "category": "Compute",
                    "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🖥️</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">EC2 Instance (MyEC2Instance)</text>\n        </svg>",
                    "width": 50,
                    "height": 50
                },
                "x": 79,
                "y": 182,
                "serviceId": "ec2",
                "subServiceId": "ec2-instance",
                "properties": {
                    "instanceType": "t2.micro",
                    "ami": "ami-0abcdef1234567890",
                    "keyPair": "",
                    "name": "MyEC2Instance"
                },
                "isSubService": true,
                "parentNodeId": "node-1761042258983-umfrdg07i"
            },
            {
                "id": "node-1761042258983-belnlxo1z",
                "icon": {
                    "id": "ebs-volume",
                    "name": "EBS Volume (MyEC2Instance)",
                    "category": "Compute",
                    "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">💾</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">EBS Volume (MyEC2Instance)</text>\n        </svg>",
                    "width": 50,
                    "height": 50
                },
                "x": 199,
                "y": 182,
                "serviceId": "ec2",
                "subServiceId": "ebs-volume",
                "properties": {
                    "volumeType": "gp3",
                    "size": 20,
                    "encrypted": false,
                    "name": "MyEC2Instance"
                },
                "isSubService": true,
                "parentNodeId": "node-1761042258983-umfrdg07i"
            },
            {
                "id": "node-1761042258983-fbf25rjaa",
                "icon": {
                    "id": "security-group",
                    "name": "Security Group (MyEC2Instance)",
                    "category": "Compute",
                    "svg": "<svg width=\"50\" height=\"50\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n          <rect x=\"5\" y=\"5\" width=\"40\" height=\"40\" rx=\"4\" fill=\"#4F46E5\" stroke=\"#232F3E\" stroke-width=\"2\"/>\n          <text x=\"25\" y=\"20\" text-anchor=\"middle\" fill=\"white\" font-size=\"16\" font-family=\"Inter, sans-serif\">🛡️</text>\n<text x=\"25\" y=\"35\" text-anchor=\"middle\" fill=\"white\" font-size=\"8\" font-family=\"Inter, sans-serif\">Security Group (MyEC2Instance)</text>\n        </svg>",
                    "width": 50,
                    "height": 50
                },
                "x": 319,
                "y": 182,
                "serviceId": "ec2",
                "subServiceId": "security-group",
                "properties": {
                    "groupName": "default-sg",
                    "inboundRules": "",
                    "name": "MyEC2Instance",
                    "securityGroups": [
                        "web-sg"
                    ]
                },
                "isSubService": true,
                "parentNodeId": "node-1761042258983-umfrdg07i"
            }
        ]
    }
]