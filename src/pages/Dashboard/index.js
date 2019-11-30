import React  from 'react';
//import { Link } from 'react-router-dom';
import {auction_api, user_api} from '../../services/api'
import './styles.css';
import * as signalR from '@aspnet/signalr'
//import { bindExpression } from '@babel/types';


export default class Dashboard extends React.Component {
    
    constructor (props){
        super(props);
        this.state = {auctions: [], userId: 0, userName: ""};
        this.bid = this.bid.bind(this);
    }


    componentDidMount(){
        
        let id = window.prompt('Please! Your user id:', 0);    
        this.setState({userId: id});

    
        user_api.get('/api/User/'+parseInt(id))
        .then(res => {
            const user = res.data;
            this.setState({userName: user.name});
            //alert("Bem Vindo "+user.name+"!");
        });

        auction_api.get('/api/Auction?tenantId=3')
        .then(res => {
            const aucts = res.data;
            this.setState({auctions: aucts});
        })

        let connection = null;
        const protocol = new signalR.JsonHubProtocol();
        const transport = signalR.HttpTransportType.WebSockets;

        const options = {
            transport,
            logMessageContent: true,
            logger: signalR.LogLevel.Trace
        };

        // create the connection instance
        connection = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:5007/signalr', options)//https://localhost:5007 44367
        .withHubProtocol(protocol)
        .build();

        connection.on('ReceiveTime',(auctionId, time) => {
           let auction = this.state.auctions.find(function(element){
               return element.id === auctionId;
           });
           auction.stopwatchTime = time;
           this.forceUpdate();
        
        });
        
        connection.start()
        .then(() => console.info('SignalR Connected'))
        .catch(err => console.error('SignalR Connection Error: ', err));

    }
    
    async bid(auctionId) {
        try {
           let response = await auction_api.post('/api/Auction/'+auctionId+'/bid?tenantId=3', { 'UserId': parseInt(this.state.userId), 'AuctionProductId': auctionId  });
            console.log('👉 Returned data:', response);
          } catch (e) {
            console.log(`😱 Axios bid request failed: ${e}`);
            alert(e.response.data);
          }
    }

   render(){     
    return (
            <>
                <ul className="spot-list">
                    <h2>{"Olá: "+this.state.userName}</h2>
                    {this.state.auctions.map(auction => (
                        <li key={auction.id}>
                            <header style={{ backgroundImage: `url(${auction.urlImg})` }}> </header>   
                            <span>{auction.description}</span> 
                            <span>{"Data Abertura: "+auction.openingDate}</span>
                            <span>{"Preço Mínimo: "+auction.minValue ? `R$ ${auction.minValue/100}` : 'Sem preço mínimo' }</span>
                            <span>{"Timer: "+auction.stopwatchTime}</span>
                            <button className="btn" onClick={this.bid.bind(this, auction.id)}>Bid</button>
                        </li> 
                    ))}
                </ul>

            </>
        )
    }
}

/* */