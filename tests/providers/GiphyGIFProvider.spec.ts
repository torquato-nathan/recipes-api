import axios, { AxiosResponse } from 'axios';
import { NotImplemented } from '../../src/errors';
import { GIFResponse, GiphyGIFProvider } from '../../src/providers';

interface SutFactory {
	sut: GiphyGIFProvider;
	baseUrl: string;
	apiKey: string;
	gifNotFoundUrl: string;
}

function makeSut(): SutFactory {
	const baseUrl = 'baseUrl';
	const apiKey = 'apiKey';
	const gifNotFoundUrl = 'gifNotFoundUrl';
	const sut = new GiphyGIFProvider(baseUrl, apiKey, gifNotFoundUrl);

	return {
		sut,
		baseUrl,
		apiKey,
		gifNotFoundUrl,
	};
}

const mockedData = {
	id: 'random-text',
	images: {
		original: {
			height: '600',
			width: '600',
			size: '43487171',
			url: 'https://media2.giphy.com/id.gif',
		},
	},
};

async function getMockedResponse(): Promise<AxiosResponse<GIFResponse>> {
	return {
		config: {},
		headers: {},
		status: 200,
		statusText: '',
		data: {
			data: [{ ...mockedData }, { ...mockedData }],
		},
	};
}

describe('GiphyGIFProvider', () => {
	beforeAll(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should use axios to make a GET Request', async () => {
		const { sut } = makeSut();
		const axiosSpy = jest.spyOn(axios, 'get').mockReturnValue(getMockedResponse());
		await sut.getByKeyword(['A great recipe', 'Another amazng one']);

		expect(axiosSpy).toHaveBeenCalled();
	});

	test('should call API with correct config', async () => {
		const { sut, baseUrl, apiKey } = makeSut();
		const axiosSpy = jest.spyOn(axios, 'get').mockReturnValue(getMockedResponse());
		const keywords = ['A great recipe', 'Another amazng one'];
		await sut.getByKeyword(keywords);

		expect(axiosSpy).toHaveBeenLastCalledWith(baseUrl, {
			params: {
				api_key: apiKey,
				limit: 1,
				q: keywords[1],
			},
		});
	});

	test('should throw SystemException if API response does not match expected schema', async () => {
		jest.spyOn(axios, 'get').mockReturnValue(
			Promise.resolve({
				data: {
					gifs: [],
				},
			}),
		);
		const { sut } = makeSut();

		const promise = sut.getByKeyword(['Recipe 1', 'Recipe 2']);
		await expect(promise).rejects.toThrow(NotImplemented);
	});

	test('should throw SystemException if recipe object in API response does not match expected schema', async () => {
		jest.spyOn(axios, 'get').mockReturnValue(
			Promise.resolve({
				data: {
					data: [
						{
							imageList: {},
						},
					],
				},
			}),
		);
		const { sut } = makeSut();

		const promise = sut.getByKeyword(['onions', 'orange']);
		await expect(promise).rejects.toThrow(NotImplemented);
	});

	test('should return a title-gif object', async () => {
		jest.spyOn(axios, 'get').mockReturnValue(getMockedResponse());
		const { sut } = makeSut();

		const response = await sut.getByKeyword(['Recipe 1', 'Recipe 2']);
		expect(response).toMatchObject({
			'Recipe 1': mockedData.images.original.url,
			'Recipe 2': mockedData.images.original.url,
		});
	});
});
