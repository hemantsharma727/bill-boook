import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Document from '../common/Document';
import Page from '../common/Page';
import View from '../common/View';
import Text from '../common/Text';
import Invoice from '../Sales';

// Font.register({
//   family: 'Nunito',
//   fonts: [
//     { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
//     { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf', fontWeight: 600 }
//   ]
// });

const InvoicesList = () => {
  const pdfMode = false;
  const [invoices, setInvoices] = useState([]);
  /* 
  const handleRemove = i => {
    const items = invoice.items.filter((productLine, index) => index !== i);
    setInvoice({ ...invoice, items });
  };

  const handleAdd = () => {
    const items = [...invoice.items, { ...initialItemData }];
    setInvoice({ ...invoice, items });
  };
 */
  useEffect(() => {
    axios
      .get('http://localhost:3000/invoiceDetails')
      .then(function (response) {
        if (response.data) {
          setInvoices([...response.data]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  return (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        {/** Table Header */}
        <View className="mt-30 bg-secondary b-b-primary flex " pdfMode={pdfMode}>
          <View className="p-8-8 w-33" pdfMode={pdfMode}>
            <Text className="text-color bold" pdfMode={pdfMode}>
              Invoice Number
            </Text>
          </View>
          <View className="p-8-8 w-33" pdfMode={pdfMode}>
            <Text className="text-color bold" pdfMode={pdfMode}>
              Buyer Name
            </Text>
          </View>
          <View className="p-8-8 w-33" pdfMode={pdfMode}>
            <Text className="text-color bold" pdfMode={pdfMode}>
              Actions
            </Text>
          </View>
        </View>

        {/** Table Body */}
        {invoices.map((invoice, i) => {
          return (
            <View key={i} className="row flex " pdfMode={pdfMode}>
              <View className="p-8-8  w-33" pdfMode={pdfMode}>
                <Text>{invoice.invoiceNumber}</Text>
              </View>
              <View className="p-8-8  w-33" pdfMode={pdfMode}>
                <Text>{invoice.buyerName}</Text>
              </View>
              <View className="p-8-8  w-33" pdfMode={pdfMode}>
                <Link to={`/sales/invoice/${invoice.invoiceNumber}`}>Edit Invoice</Link>
              </View>
            </View>
          );
        })}

        <View className="mt-30 invoice-border-bottom" pdfMode={pdfMode} />
      </Page>
    </Document>
  );
};

export default InvoicesList;
