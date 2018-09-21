define({ "api": [
  {
    "type": "post",
    "url": "/api/addProduct",
    "title": "Add Product",
    "name": "_api_addProduct",
    "group": "Product",
    "description": "<p>Add product user to products database</p>",
    "header": {
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"admin-token\": \"xxxx\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": " {\n     \"productId\":\"19\",\n\t    \"productName\":\"peach\",\n\t    \"price\":4,\n\t    \"quantity\": 200\n  }",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"posted\":true\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Product",
            "description": "<p>could not be added.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"posted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "Product"
  },
  {
    "type": "delete",
    "url": "/api/deleteProduct",
    "title": "Delete Product",
    "name": "_api_deleteProduct",
    "group": "Product",
    "description": "<p>Delete a product given a product ID</p>",
    "header": {
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"productID\": \"1\",\n  \"token\" \"xxxx\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"deleted\": true\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Product",
            "description": "<p>could not be deleted.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"deleted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "Product"
  },
  {
    "type": "get",
    "url": "/api/getProduct/",
    "title": "Get Product(s)",
    "name": "_api_getProduct",
    "group": "Product",
    "description": "<p>Get a list of products or a single product(if product param is specified)</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "productId",
            "optional": false,
            "field": "Product",
            "description": "<p>unique id.</p>"
          }
        ]
      }
    },
    "header": {
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"token\": \"xxxx\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n        {\n             \"productId\": \"1\",\n             \"productName\": \"pear\",\n             \"price\": 13,\n             \"key\": \"-LM5i9ElD6_7kv0VJrHN\",\n             \"quantity\":270\n         },\n         {\n             \"productId\": \"2\",\n             \"productName\": \"apple\",\n             \"price\": 1,\n             \"key\": \"-LM5lJwDYyAErIJM9mJL\"\n             \"quantity\":370\n         }\n ]",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Product",
            "description": "<p>could not be found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"posted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "Product"
  },
  {
    "type": "patch",
    "url": "/api/modifyProduct",
    "title": "Modify Product",
    "name": "_api_modifyProduct",
    "group": "Product",
    "description": "<p>Modify product information</p>",
    "header": {
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"token\": \"xxxx\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n\t    \"productId\":1,\n\t    \"quantity\": 10\n }",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"posted\":true\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Product",
            "description": "<p>could not be modified.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"posted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "Product"
  },
  {
    "type": "patch",
    "url": "/api/addCart",
    "title": "Add Cart",
    "name": "_api_addCart",
    "group": "User",
    "description": "<p>Add product to cart</p>",
    "header": {
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"token\": \"xxxx\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n\t\"product\":{\n\t\t\"name\":\"orange\",\n\t\t\"quantity\":7,\n\t\t\"price\":4,\n\t\t\"id\":3\n\t  }\n  }",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"posted\":true\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "Product",
            "description": "<p>could not be added to cart.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"posted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/createUser/",
    "title": "Sign-Up",
    "name": "_api_createUser_",
    "group": "User",
    "description": "<p>Create a new user in the DB</p>",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n     \"password\":\"1234\",\n     \"username\":\"person123\",\n     \"first\":\"Person\",\n     \"last\":\"Last\"\n }",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"posted\":true,\n    \"token\":\"xxxx\"\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "User",
            "description": "<p>could not be created.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"posted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "User"
  },
  {
    "type": "post",
    "url": "/api/login",
    "title": "Login",
    "name": "_api_login",
    "group": "User",
    "description": "<p>Login user to shop</p>",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n     \"password\":\"1234\",\n     \"username\":\"person123\",\n }",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"posted\":true,\n    \"token\":\"xxxx\"\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "User",
            "description": "<p>was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"posted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/api/userProfile/",
    "title": "User Profile",
    "name": "_api_userProfile",
    "group": "User",
    "description": "<p>Request User information</p>",
    "header": {
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"token\": \"xxxx\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n \"username\": \"nim.wijetunga@gmail.com\",\n  \"products\": [\n        {\n             \"id\": \"1\",\n             \"name\": \"apple\",\n             \"price\": 12,\n             \"quantity\": 4\n         },\n         {\n             \"id\": \"3\",\n           \"name\": \"orange\",\n            \"price\": 12,\n             \"quantity\": 2\n        }\n     ]\n }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "User",
            "description": "<p>was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n   \"posted\": false\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "backend/server.js",
    "groupTitle": "User"
  }
] });
