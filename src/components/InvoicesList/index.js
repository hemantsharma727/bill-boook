import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Document from '../common/Document';
import Download from '../common/DownloadPDF';
import Page from '../common/Page';
import View from '../common/View';
import Text from '../common/Text';

const InvoicesList = () => {
  const pdfMode = false;
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:7890/invoiceDetails/list')
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
          <View className="p-8-8 w-25" pdfMode={pdfMode}>
            <Text className="text-color bold" pdfMode={pdfMode}>
              Invoice Number
            </Text>
          </View>
          <View className="p-8-8 w-25" pdfMode={pdfMode}>
            <Text className="text-color bold" pdfMode={pdfMode}>
              Buyer Name
            </Text>
          </View>
          <View className="p-8-8 w-25" pdfMode={pdfMode}>
            <Text className="text-color bold" pdfMode={pdfMode}>
              Buyer GSTN
            </Text>
          </View>
          <View className="p-8-8 w-25" pdfMode={pdfMode}>
            <Text className="text-color bold" pdfMode={pdfMode}>
              Actions
            </Text>
          </View>
        </View>

        {/** Table Body */}
        {invoices.map((invoice, i) => {
          return (
            <View key={i} className="row flex " pdfMode={pdfMode}>
              <View className="p-8-8  w-25" pdfMode={pdfMode}>
                <Text>{invoice.invoiceNumber}</Text>
              </View>
              <View className="p-8-8  w-25" pdfMode={pdfMode}>
                <Text>{invoice.buyerName}</Text>
              </View>
              <View className="p-8-8  w-25" pdfMode={pdfMode}>
                <Text>{invoice.buyerGstn}</Text>
              </View>
              <View className="p-8-8  w-25" pdfMode={pdfMode}>
                <Link to={`/sales/invoice/${invoice.invoiceNumber}`}>Edit Invoice</Link>
                <button className="download-pdf-button"><Download data={invoice} /></button>
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
