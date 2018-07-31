import React, { Component } from 'react';
import VirtualList from 'react-tiny-virtual-list';
import ReactResizeDetector from 'react-resize-detector';
import faker from 'faker'
import Panel from 'muicss/lib/react/panel';
import {Col, Row, Input, Container, Button} from 'muicss/react';
import '@fortawesome/fontawesome-free/css/all.css'
import 'muicss/dist/css/mui.min.css';
import './App.css';


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            scrollToIndex: ''
        };
    }

    processingAllMessages(data){
        data.forEach((item, index) => { //TODO не передавать по ссылке
            let itemSize = 88; // 88 - Величина вычисленная вручную (можно и автоматизировать) = сумма постоянных высот (username, panel's padding and margin)
            //Проверка для расставления лейблов с датой
            if(item.isNewMessage){
                itemSize += 71; //Высота лэйбла о новых сообжениях + увеличенный margin снизу
            }
            if((index === 0 && item.date.getDate() !== new Date().getDate()) ||
                (index !== 0 && item.date.getDate() !== data[index - 1].date.getDate())) {
                itemSize += 41; //Высота лэйбла с датой, вычисленна вручную
                item.hasDateLabel = true;
                //Проверка для объединения сообщений
            }else if(index !== 0 &&
                data[index - 1].date - item.date < 900000 &&
                data[index - 1].name === item.name){

                data[index - 1].size -= 10;
                item.isMergeWithPrevMessage = true;
            }
            document.getElementById('messageSizeMeter').innerHTML = item.message;
            item.size = itemSize + document.getElementById('messageSizeMeter').clientHeight;
        });
        this.setState({data: data});
    }

    loadingMessages(isInitChat){
        let data = this.state.data;
        for(let i = 0; i < 100; i++){
            let date = new Date();
            let name = faker.name.findName();
            if(isInitChat){
                if(i <= 5 && i >=1){
                    name = 'Combined message';
                    date.setMinutes(date.getMinutes() - i - 30);
                }
                if(i <= 10 && i > 5){
                    date.setMinutes(date.getMinutes() - i - 50);
                }
                if(i < 20 && i > 10){
                    date.setDate(date.getDate() - i);
                }
            }else{
                date = date.setDate(date.getDate() - 100 - this.state.data.length);
            }
            date = new Date(date);

            data.push({
                name: name,
                avatarUrl: faker.image.avatar(),
                message: faker.lorem.paragraphs(),
                date: date,
                isNewMessage: (isInitChat && i === 0) ? true : false
            })
        }
        this.processingAllMessages(data);
    }

    loadMoreMessages(e) {
        if(this.state.data.length === (e.stopIndex + 1)) {
            this.loadingMessages();
        }
    }

    increaseMessageHeight(index) {
        let data = this.state.data;
        data[index].imgUrl = faker.image.avatar();
        data[index].size = data[index].size + 128;
        this.setState({data: data, scrollToIndex: index});
    }

    deleteMessage(index) {
        let data = this.state.data;
        data.splice(index, 1);
        this.setState({data: data, scrollToIndex: index});
    }

    formatDate(date, mode) {
        if(mode === 'date'){
            return (date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear());
        }else{
            return (date.getHours() + ':' + date.getMinutes());
        }
    }

    componentDidMount(){
        this.loadingMessages(true);
    }

    render() {
        return (
            <div>
                <ReactResizeDetector handleWidth handleHeight onResize={() => {this.processingAllMessages(this.state.data)}} />
                <Container>
                    <Row>
                        <Input type='number' placeholder='Enter index' value={this.state.scrollToIndex} onChange={(e) => {this.setState({scrollToIndex: e.target.value})} } />
                    </Row>
                    <Row>
                        <div style={{width: '100%'}}>
                            <Col xs='11' style={{position: 'relative'}}>
                                <div id='messageSizeMeter' style={{position: 'absolute', visibility: 'hidden', width: 'calc(100% - 30px)'}}></div>
                            </Col>
                        </div>
                        <VirtualList
                            width='100%'
                            height={760}
                            itemCount={this.state.data.length !== 0 ? this.state.data.length : 1}
                            scrollToIndex={this.state.scrollToIndex * 1}
                            scrollToAlignment={'auto'}
                            itemSize={this.state.data.length !== 0 ? (index) => this.state.data[index].size : 0}
                            onItemsRendered={(e) => {this.loadMoreMessages(e)}}
                            renderItem={({index, style}) => {
                                if(this.state.data.length === 0){
                                    return <div key={index} style={style}/>
                                }
                                let newMessagesLabel = null;
                                let dateLabel = null;
                                let img = null;
                                if(this.state.data[index].isNewMessage) {
                                    newMessagesLabel = (<div style={{textAlign: 'center', padding: '5px', marginBottom: '10px'}}>
                                        <span style={{backgroundColor: '#acacac', padding: '5px 10px', borderRadius: '20px'}}>New messages</span>
                                    </div>);
                                }
                                if(this.state.data[index].hasDateLabel) {
                                    dateLabel = (<div style={{textAlign: 'center', padding: '5px', marginBottom: '10px'}}>
                                        <span style={{backgroundColor: '#acacac', padding: '5px 10px', borderRadius: '20px'}}>{this.formatDate(this.state.data[index].date, 'date')}</span>
                                    </div>);
                                }
                                if(this.state.data[index].imgUrl){
                                    img = (<img src={this.state.data[index].imgUrl}/>);
                                }
                                return <div key={index} style={style}>
                                    {newMessagesLabel}
                                    {dateLabel}
                                    <Panel style={{marginBottom: '10px'}}>
                                        <Row>
                                            <Col xs='1'>
                                                <img src={this.state.data[index].avatarUrl}
                                                     style={{borderRadius: '50px', height: '70px', width: '70px', display: this.state.data[index].isMergeWithPrevMessage ? 'none' : 'unset'}}/>
                                            </Col>
                                            <Col xs='11'>
                                                <Row>
                                                    <Col xs='6'>
                                                        <div className='mui--text-subhead' style={{display: this.state.data[index].isMergeWithPrevMessage ? 'none' : 'unset'}}>{this.state.data[index].name}</div>
                                                    </Col>
                                                    <Col xs='6' className='mui--text-right'>
                                                        <span>{this.formatDate(this.state.data[index].date, 'time')}</span>
                                                        <Button variant='flat' title='Increase message height'
                                                                onClick={() => this.increaseMessageHeight(index)}><i
                                                            className='fas fa-pen'/></Button>
                                                        <Button variant='flat' title='Delete message'
                                                                onClick={() => this.deleteMessage(index)}><i
                                                            className='fas fa-times'/>
                                                        </Button>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs='12'>
                                                        <div>{this.state.data[index].message}</div>
                                                        {img}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Panel>
                                </div>

                            }}
                        />
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;
