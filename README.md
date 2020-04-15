# Fr-Carousel

Fr-Carousel is a friendly angular carousel component and it supports swipe feature for touch devices.


## Installation

```
npm install fr-carousel --save
```
Once installed you need to import the module:
```
import  {FrCarouselModule}  from  'fr-carousel';

@NgModule({

 ...

 imports:  [FrCarouselModule,  ...],

 ...

})

export class  AppModule  {

}
```
## Usage

```
<fr-carousel>
	<ng-template Slide>
		...
	</ng-template>
	<ng-template Slide>
		...
	</ng-template>
	<ng-template Slide>
		...
	</ng-template>
</fr-carousel>
```
## fr-carousel
#### selector: `fr-carousel`
### Inputs

| Input | Type | Default |Description|
| :---         |     :---:      |  :--- |:---
| `showNavigationArrows` |`boolean` | `true` |if `true`, 'previous' and 'next' navigation arrows will be visible on the slide.
| `showNavigationIndicators` | `boolean` |`true`|If `true`, navigation indicators at the bottom of the slide will be visible.   |
|`keyboard`|`boolean`|`true`|If `true`, allows to interact with carousel using keyboard 'arrow left' and 'arrow right'.
|`interval`|`boolean`|`5000`|Time in milliseconds before the next slide is shown. Note: if the value is `less than` `500` then it will be set as `500`.|
|`pauseOnHover`|`boolean`|`true`|If `true`, will pause slide switching when mouse cursor hovers the slide.|
### Methods
| Method| Description|
| :---         |:---
|` prev` |`prev()`  => void <br/>Navigates to the previous slide.
| `next` |`next()`  => void <br/>Navigates to the next slide.
| `pause` |`pause()`  => void <br/>Pauses cycling through the slides.
| `cycle` |`cycle()`  => void <br/>Restarts cycling through the slides from left to right.

## Slide
### selector: `ng-template[Slide]`
### Inputs

| Input | Type | Description|
| :---  |     :---:  |  :--- 
| `id` |`string` |Slide id that must be unique for the entire document.<br/>If not provided, will be generated in the  `fr-slide-x`  format.