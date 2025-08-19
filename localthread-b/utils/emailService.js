const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  orderConfirmation: {
    subject: 'Order Confirmed - LocalThread',
    template: 'order-confirmation.html'
  },
  orderStatusUpdate: {
    subject: 'Order Status Updated - LocalThread',
    template: 'order-status-update.html'
  },
  passwordReset: {
    subject: 'Password Reset Request - LocalThread',
    template: 'password-reset.html'
  },
  emailVerification: {
    subject: 'Verify Your Email - LocalThread',
    template: 'email-verification.html'
  },
  shopNotification: {
    subject: 'New Update from {shopName} - LocalThread',
    template: 'shop-notification.html'
  },
  welcomeEmail: {
    subject: 'Welcome to LocalThread!',
    template: 'welcome-email.html'
  },
  vendorApproval: {
    subject: 'Vendor Account Approved - LocalThread',
    template: 'vendor-approval.html'
  },
  productApproval: {
    subject: 'Product Approved - LocalThread',
    template: 'product-approval.html'
  }
};

// Load email template
async function loadTemplate(templateName, data = {}) {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', templateName);
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Replace placeholders with data
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(placeholder, data[key]);
    });
    
    return template;
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    return null;
  }
}

// Send email
async function sendEmail(to, templateName, data = {}) {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const htmlContent = await loadTemplate(template.template, data);
    if (!htmlContent) {
      throw new Error(`Failed to load template '${template.template}'`);
    }

    const mailOptions = {
      from: `"LocalThread" <${process.env.SMTP_USER}>`,
      to: to,
      subject: template.subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
}

// Send order confirmation email
async function sendOrderConfirmation(order, user) {
  try {
    const orderItems = order.items.map(item => ({
      name: item.productSnapshot.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    const data = {
      userName: user.name,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt.toLocaleDateString(),
      totalAmount: order.totalAmount,
      shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
      items: orderItems.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${item.total}</td>
        </tr>
      `).join(''),
      trackingUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`
    };

    await sendEmail(user.email, 'orderConfirmation', data);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

// Send order status update email
async function sendOrderStatusUpdate(order, user, status, notes = '') {
  try {
    const statusMessages = {
      'confirmed': 'Your order has been confirmed and is being processed.',
      'processing': 'Your order is being prepared for shipping.',
      'shipped': 'Your order has been shipped and is on its way.',
      'delivered': 'Your order has been delivered successfully.',
      'cancelled': 'Your order has been cancelled.',
      'refunded': 'Your order has been refunded.'
    };

    const data = {
      userName: user.name,
      orderNumber: order.orderNumber,
      status: status.charAt(0).toUpperCase() + status.slice(1),
      message: statusMessages[status] || 'Your order status has been updated.',
      notes: notes,
      trackingUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`
    };

    await sendEmail(user.email, 'orderStatusUpdate', data);
  } catch (error) {
    console.error('Error sending order status update email:', error);
  }
}

// Send password reset email
async function sendPasswordReset(user, resetToken) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const data = {
      userName: user.name,
      resetUrl: resetUrl,
      expiryTime: '1 hour'
    };

    await sendEmail(user.email, 'passwordReset', data);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}

// Send email verification
async function sendEmailVerification(user, verificationToken) {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const data = {
      userName: user.name,
      verificationUrl: verificationUrl
    };

    await sendEmail(user.email, 'emailVerification', data);
  } catch (error) {
    console.error('Error sending email verification:', error);
  }
}

// Send shop notification
async function sendShopNotification(shop, followers, notificationType, data = {}) {
  try {
    const notificationMessages = {
      'newProducts': 'New products have been added to the shop!',
      'offers': 'New offers and discounts available!',
      'updates': 'Shop updates and announcements!'
    };

    const emailData = {
      shopName: shop.name,
      shopLogo: shop.logo,
      message: notificationMessages[notificationType] || 'New update from the shop!',
      ...data
    };

    // Send to all followers who have enabled this notification type
    const eligibleFollowers = followers.filter(follower => 
      follower.notifications[notificationType]
    );

    for (const follower of eligibleFollowers) {
      try {
        await sendEmail(follower.followerId.email, 'shopNotification', {
          ...emailData,
          userName: follower.followerId.name
        });
      } catch (error) {
        console.error(`Error sending shop notification to ${follower.followerId.email}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending shop notification:', error);
  }
}

// Send welcome email
async function sendWelcomeEmail(user) {
  try {
    const data = {
      userName: user.name,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      exploreUrl: `${process.env.FRONTEND_URL}/shops`
    };

    await sendEmail(user.email, 'welcomeEmail', data);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

// Send vendor approval email
async function sendVendorApproval(user) {
  try {
    const data = {
      userName: user.name,
      dashboardUrl: `${process.env.FRONTEND_URL}/vendor/dashboard`,
      shopCreationUrl: `${process.env.FRONTEND_URL}/vendor/shop/create`
    };

    await sendEmail(user.email, 'vendorApproval', data);
  } catch (error) {
    console.error('Error sending vendor approval email:', error);
  }
}

// Send product approval email
async function sendProductApproval(user, product) {
  try {
    const data = {
      userName: user.name,
      productName: product.name,
      productUrl: `${process.env.FRONTEND_URL}/products/${product._id}`,
      dashboardUrl: `${process.env.FRONTEND_URL}/vendor/products`
    };

    await sendEmail(user.email, 'productApproval', data);
  } catch (error) {
    console.error('Error sending product approval email:', error);
  }
}

// Send bulk email (for admin notifications)
async function sendBulkEmail(recipients, templateName, data = {}) {
  try {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await sendEmail(recipient.email, templateName, {
          ...data,
          userName: recipient.name
        });
        results.push({ email: recipient.email, success: true, messageId: result.messageId });
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error sending bulk email:', error);
    throw error;
  }
}

// Test email service
async function testEmailService() {
  try {
    const testData = {
      userName: 'Test User',
      orderNumber: 'ORD-20241201-ABC123',
      totalAmount: 1500,
      items: '<tr><td>Test Product</td><td>1</td><td>₹1500</td><td>₹1500</td></tr>'
    };

    const result = await sendEmail(
      process.env.TEST_EMAIL || 'test@example.com',
      'orderConfirmation',
      testData
    );

    console.log('Email service test successful:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email service test failed:', error);
    return false;
  }
}

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPasswordReset,
  sendEmailVerification,
  sendShopNotification,
  sendWelcomeEmail,
  sendVendorApproval,
  sendProductApproval,
  sendBulkEmail,
  testEmailService
}; 